'use strict';

/**
 * Login controller.
 */
angular.module('docs').controller('Login', function (Restangular, $scope, $rootScope, $state, $stateParams, $dialog, User, $translate, $uibModal) {
  $scope.codeRequired = false;

  // Get the app configuration
  Restangular.one('app').get().then(function (data) {
    $rootScope.app = data;
  });

  // Login as guest
  $scope.loginAsGuest = function () {
    $scope.user = {
      username: 'guest',
      password: ''
    };
    $scope.login();
  };

  // Login
  $scope.login = function () {
    User.login($scope.user).then(function () {
      User.userInfo(true).then(function (data) {
        $rootScope.userInfo = data;
      });

      if ($stateParams.redirectState !== undefined && $stateParams.redirectParams !== undefined) {
        $state.go($stateParams.redirectState, JSON.parse($stateParams.redirectParams))
          .catch(function () {
            $state.go('document.default');
          });
      } else {
        $state.go('document.default');
      }
    }, function (data) {
      if (data.data.type === 'ValidationCodeRequired') {
        // A TOTP validation code is required to login
        $scope.codeRequired = true;
      } else {
        // Login truly failed
        var title = $translate.instant('login.login_failed_title');
        var msg = $translate.instant('login.login_failed_message');
        var btns = [{ result: 'ok', label: $translate.instant('ok'), cssClass: 'btn-primary' }];
        $dialog.messageBox(title, msg, btns);
      }
    });
  };

  // 注册弹窗
  $scope.register = function () {
    $uibModal.open({
      template:
        '<div class="modal-header">' +
        '  <h3>{{ "login.register" | translate }}</h3>' +
        '</div>' +
        '<div class="modal-body">' +
        '  <form name="registerForm" novalidate autocomplete="off">' +
        '    <div class="form-group">' +
        '      <label>{{ "settings.user.edit.username" | translate }}</label>' +
        '      <input class="form-control" type="text" name="username" ng-model="user.username" required ng-pattern="/^[a-zA-Z0-9_@.-]*$/" ng-minlength="3" ng-maxlength="50" ng-attr-placeholder="{{ \'settings.user.edit.username\' | translate }}" />' +
        '    </div>' +
        '    <div class="form-group">' +
        '      <label>{{ "settings.user.edit.email" | translate }}</label>' +
        '      <input class="form-control" type="email" name="email" ng-model="user.email" required ng-minlength="1" ng-maxlength="100" ng-attr-placeholder="{{ \'settings.user.edit.email\' | translate }}" />' +
        '    </div>' +
        '    <div class="form-group">' +
        '      <label>{{ "settings.user.edit.password" | translate }}</label>' +
        '      <input class="form-control" type="password" name="password" ng-model="user.password" required ng-minlength="8" ng-maxlength="50" ng-attr-placeholder="{{ \'settings.user.edit.password\' | translate }}" />' +
        '    </div>' +
        '    <div class="form-group">' +
        '      <label>{{ "settings.user.edit.password_confirm" | translate }}</label>' +
        '      <input class="form-control" type="password" name="passwordconfirm" ng-model="user.passwordconfirm" required ng-attr-placeholder="{{ \'settings.user.edit.password_confirm\' | translate }}" />' +
        '    </div>' +
        '  </form>' +
        '</div>' +
        '<div class="modal-footer">' +
        '  <button class="btn btn-success" ng-click="ok()" ng-disabled="registerForm.$invalid">{{ "login.register" | translate }}</button>' +
        '  <button class="btn btn-default" ng-click="cancel()">{{ "cancel" | translate }}</button>' +
        '</div>',
      controller: function ($scope, $uibModalInstance, Restangular, $dialog, $translate) {
        $scope.user = {};

        $scope.ok = function () {
          if ($scope.user.password !== $scope.user.passwordconfirm) {
            var title = $translate.instant('validation.password_confirm');
            var msg = $translate.instant('validation.password_confirm');
            var btns = [{ result: 'ok', label: $translate.instant('ok'), cssClass: 'btn-primary' }];
            $dialog.messageBox(title, msg, btns);
            return;
          }
          var user = angular.copy($scope.user);
          user.storage_quota = 10000 * 1000000;
          user.disabled = true;
          Restangular.one('user').put(user).then(function () {
            var title = $translate.instant('login.register');
            var msg = '注册申请成功，请等待管理员审核';
            var btns = [{ result: 'ok', label: $translate.instant('ok'), cssClass: 'btn-primary' }];
            $dialog.messageBox(title, msg, btns, function () {
              $uibModalInstance.close();
            });
          }, function (e) {
            var title = $translate.instant('login.register');
            var msg = e.data && e.data.message ? e.data.message : $translate.instant('settings.user.edit.edit_user_failed_message');
            var btns = [{ result: 'ok', label: $translate.instant('ok'), cssClass: 'btn-primary' }];
            $dialog.messageBox(title, msg, btns);
          });
        };

        $scope.cancel = function () {
          $uibModalInstance.dismiss('cancel');
        };
      },
      size: 'md'
    });
  };

  // Password lost
  $scope.openPasswordLost = function () {
    $uibModal.open({
      templateUrl: 'partial/docs/passwordlost.html',
      controller: 'ModalPasswordLost'
    }).result.then(function (username) {
      if (username === null) {
        return;
      }

      // Send a password lost email
      Restangular.one('user').post('password_lost', {
        username: username
      }).then(function () {
        var title = $translate.instant('login.password_lost_sent_title');
        var msg = $translate.instant('login.password_lost_sent_message', { username: username });
        var btns = [{ result: 'ok', label: $translate.instant('ok'), cssClass: 'btn-primary' }];
        $dialog.messageBox(title, msg, btns);
      }, function () {
        var title = $translate.instant('login.password_lost_error_title');
        var msg = $translate.instant('login.password_lost_error_message');
        var btns = [{ result: 'ok', label: $translate.instant('ok'), cssClass: 'btn-primary' }];
        $dialog.messageBox(title, msg, btns);
      });
    });
  };
});