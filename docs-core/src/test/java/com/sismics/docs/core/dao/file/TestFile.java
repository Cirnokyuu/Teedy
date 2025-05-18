package com.sismics.docs.core.dao.file;

import com.sismics.docs.BaseTransactionalTest;
import com.sismics.docs.core.dao.UserDao;
import com.sismics.docs.core.dao.FileDao;
import com.sismics.docs.core.model.jpa.File;
import com.sismics.docs.core.model.jpa.User;
import com.sismics.docs.core.util.TransactionUtil;
import com.sismics.docs.core.util.authentication.InternalAuthenticationHandler;

import org.junit.Assert;
import org.junit.Test;

/**
 * Tests the persistance layer.
 * 
 * @author jtremeaux
 */
public class TestFile extends BaseTransactionalTest {
    @Test
    public void testFile() throws Exception {
        // Create a user
        UserDao userDao = new UserDao();
        FileDao fileDao = new FileDao();
        User user = createUser("testJpa");
        File file = createFile(user, 4096L);
        TransactionUtil.commit();

        // Search a user by his ID
        user = userDao.getById(user.getId());
        Assert.assertNotNull(user);
        Assert.assertEquals("toto@docs.com", user.getEmail());

        // Authenticate using the database
        Assert.assertNotNull(new InternalAuthenticationHandler().authenticate("testJpa", "12345678"));
        
        // Get File by ID
        File fileFromDb = fileDao.getFile(file.getId());
        Assert.assertNotNull(fileFromDb);
        Assert.assertEquals(file.getId(), fileFromDb.getId());

        // Delete the created file & user
        fileDao.delete(file.getId(), user.getId());
        userDao.delete("testJpa", user.getId());
        TransactionUtil.commit();
    }
}
