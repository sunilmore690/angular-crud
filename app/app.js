var app = angular.module('myApp', ['ngRoute']);
app.factory("services", ['$http', function($http) {
  var serviceBase = 'https://sunilmore-rest-api.herokuapp.com/api/'
    var obj = {};
    obj.getCustomers = function(){
        return $http.get(serviceBase + 'users');
    }
    obj.getCustomer = function(customerID){
        return $http.get(serviceBase + 'users/' + customerID);
    }

    obj.insertCustomer = function (customer) {
    return $http.post(serviceBase + 'users', customer).then(function (results) {
        return results;
    });
	};

	obj.updateCustomer = function (id,customer) {
	    return $http.put(serviceBase + 'users/'+id, customer).then(function (status) {
	        return status.data;
	    });
	};

	obj.deleteCustomer = function (id) {
	    return $http.delete(serviceBase + 'users/' + id).then(function (status) {
	        return status.data;
	    });
	};

    return obj;   
}]);

app.controller('listCtrl', function ($scope, services) {
    services.getCustomers().then(function(data){
        $scope.customers = data.data;
        $scope.deleteCustomer = function(customerId) {
          
          if(confirm("Are you sure to delete customer number: "+customerId)==true)
          services.deleteCustomer(customerId);
          $location.path('/');
        };

    });

});

app.controller('editCtrl', function ($scope, $rootScope, $location, $routeParams, services, customer) {
    var customerID = $routeParams.customerID ;

    $rootScope.title = customerID  ? 'Edit Customer' : 'Add Customer';
    $scope.buttonText = customerID ? 'Update Customer' : 'Add New Customer';
    if(customer){
      var original = customer.data;
      original.id = customerID;
      $scope.customer = angular.copy(original);
      $scope.customer.id = customerID;

    }else{
      $scope.customer = {};
    }
    
    $scope.isClean = function() {
      return angular.equals(original, $scope.customer);
    }

    $scope.deleteCustomer = function(customer) {
      $location.path('/');
      if(confirm("Are you sure to delete customer number: "+$scope.customer.id)==true)
      services.deleteCustomer(customer.customerNumber);
    };

    $scope.saveCustomer = function(customer) {
     
      if (!customerID ) {
          services.insertCustomer(customer);
      }
      else {
          services.updateCustomer(customerID, customer);
      }
       $location.path('/');
    };
});

app.config(['$routeProvider',
  function($routeProvider) {
    $routeProvider.
      when('/', {
        title: 'Customers',
        templateUrl: 'partials/customers.html',
        controller: 'listCtrl'
      })
       .when('/customer', {
        title: 'Add Customer',
        templateUrl: 'partials/edit-customer.html',
        controller: 'editCtrl',
        resolve : {
          customer:function(){
            return null;
          }
        }
      })
      .when('/customer/:customerID', {
        title: 'Edit Customers',
        templateUrl: 'partials/edit-customer.html',
        controller: 'editCtrl',
        resolve: {
          customer: function(services, $route){
            var customerID = $route.current.params.customerID;
            return services.getCustomer(customerID);
          }
        }
      })
      .otherwise({
        redirectTo: '/'
      });
}]);
app.run(['$location', '$rootScope', function($location, $rootScope) {
    $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
        $rootScope.title = current.$$route.title;
    });
}]);