package com.sismics.docs.core.service;

import com.sismics.docs.BaseTransactionalTest;
import com.sismics.docs.core.dao.UserDao;
import com.sismics.docs.core.event.FileDeletedAsyncEvent;
import com.sismics.docs.core.model.jpa.File;
import com.sismics.docs.core.model.jpa.User;
import com.sismics.docs.core.util.TransactionUtil;
import org.junit.Assert;
import org.junit.Test;

public class UserServiceTest extends BaseTransactionalTest {

    @Test
    public void testUpdatePassword() throws Exception {
        UserDao userDao = new UserDao();
        User user = createUser("testUpdatePassword");

        user.setPassword("password");
        userDao.updatePassword(user,"newpassword");

        User userFromDb = userDao.getById(user.getId());
        Assert.assertNotEquals("test114514", userFromDb.getPassword () );
        Assert. assertTrue(userFromDb.getPassword() .length () > 10);
    }
}