// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'

angular.module('citizen-engagement', ['geolocation', 'ionic', 'citizen-engagement.auth', 'citizen-engagement.constants', 'leaflet-directive'])

///////////////////////////////////////////////////////////
//////////             CONFIG                //////////////
///////////////////////////////////////////////////////////

.filter('capitalize', function() {
    return function(input, all) {
      return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) : '';
    }
  })

        .run(function ($ionicPlatform) {
            $ionicPlatform.ready(function () {
                // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
                // for form inputs)
                if (window.cordova && window.cordova.plugins.Keyboard) {
                    cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                }
                if (window.StatusBar) {
                    StatusBar.styleDefault();
                }
            });
        })
        .config(function ($stateProvider, $urlRouterProvider) {

            // Ionic uses AngularUI Router which uses the concept of states
            // Learn more here: https://github.com/angular-ui/ui-router
            // Set up the various states which the app can be in.
            // Each state's controller can be found in controllers.js
            $stateProvider

                    // This is the abstract state for the tabs directive.
                    .state('tab', {
                        url: '/tab',
                        abstract: true,
                        templateUrl: 'templates/tabs.html'
                    })

                    // The three next states are for each of the three tabs.
                    // The state names start with "tab.", indicating that they are children of the "tab" state.
                    .state('tab.newIssue', {
                        // The URL (here "/newIssue") is used only internally with Ionic; you never see it displayed anywhere.
                        // In an Angular website, it would be the URL you need to go to with your browser to enter this state.
                        url: '/newIssue',
                        views: {
                            // The "tab-newIssue" view corresponds to the <ion-nav-view name="tab-newIssue"> directive used in the tabs.html template.
                            'tab-newIssue': {
                                // This defines the template that will be inserted into the directive.
                                templateUrl: 'templates/reportIssue.html'
                            }
                        }
                    })

                    .state('tab.issueMap', {
                        url: '/issueMap',
                        views: {
                            'tab-issueMap': {
                                templateUrl: 'templates/issueMap.html',
                                controller: 'MapController'
                            }
                        }
                    })

                    .state('tab.issueList', {
                        url: '/issueList',
                        views: {
                            'tab-issueList': {
                                templateUrl: 'templates/issueList.html'

                            }
                        }
                    })
                    .state('tab.myAccountList', {
      url: '/myAccount',
      views: {
        'tab-issueList': {
          templateUrl: 'templates/myAccount.html'
        }
      }
    })
    .state('tab.myAccountMap', {
      url: '/myAccount',
      views: {
        'tab-issueMap': {
          templateUrl: 'templates/myAccount.html'
        }
      }
    })
    .state('tab.myAccountReport', {
      url: '/myAccount',
      views: {
        'tab-newIssue': {
          templateUrl: 'templates/myAccount.html'
        }
      }
    })
    .state('tab.myAccountDetailsMap', {
      url: '/myAccount',
      views: {
        'tab-issueMap': {
          templateUrl: 'templates/myAccount.html'
        }
      }
    })
    .state('tab.myAccountDetailsList', {
      url: '/myAccount',
      views: {
        'tab-issueList': {
          templateUrl: 'templates/myAccount.html'
        }
      }
    })
                    .state('login', {
                        url: '/login',
                        controller: 'LoginCtrl',
                        templateUrl: 'templates/login.html'
                    })
//                  
                    //This is the issue details state.
                    .state('tab.issueDetails', {
                        // We use a parameterized route for this state.
                        // That way we'll know which issue to display the details of.
                        url: '/issueDetails/:issueId',
                        views: {
                            // Here we use the same "tab-issueList" view as the previous state.
                            // This means that the issue details template will be displayed in the same tab as the issue list.
                            'tab-issueList': {
                                templateUrl: 'templates/issueDetails.html'
                            }
                        }
                    })
                    .state('tab.issueDetailsMap', {
      // We use a parameterized route for this state.
      // That way we'll know which issue to display the details of.
      url: '/issueDetails/:issueId',
      views: {
        // Here we use the same "tab-issueList" view as the previous state.
        // This means that the issue details template will be displayed in the same tab as the issue list.
        'tab-issueMap': {
          templateUrl: 'templates/issueDetails.html'
        }
      }
    })
    ;

            // Define the default state (i.e. the first screen displayed when the app opens).
            $urlRouterProvider.otherwise(function ($injector) {
                $injector.get('$state').go('tab.newIssue'); // Go to the new issue tab by default.
            });
        })
        .run(function (AuthService, $rootScope, $state) {

            // Listen for the $stateChangeStart event of AngularUI Router.
            // This event indicates that we are transitioning to a new state.
            // We have the possibility to cancel the transition in the callback function.
            $rootScope.$on('$stateChangeStart', function (event, toState) {

                // If the user is not logged in and is trying to access another state than "login"...
                if (!AuthService.currentUserId && toState.name != 'login') {

                    // ... then cancel the transition and go to the "login" state instead.
                    event.preventDefault();
                    $state.go('login');
                }
            });
        })
        .config(function ($httpProvider) {
            $httpProvider.interceptors.push('AuthInterceptor');
        })


///////////////////////////////////////////////////////////
//////////               CONTROLLERS         //////////////
///////////////////////////////////////////////////////////

        .controller('LoginCtrl', function (AuthService, $http, $ionicHistory, $ionicLoading, $scope, $state, apiUrl) {

            // The $ionicView.beforeEnter event happens every time the screen is displayed.
            $scope.$on('$ionicView.beforeEnter', function () {
                // Re-initialize the user object every time the screen is displayed.
                // The first name and last name will be automatically filled from the form thanks to AngularJS's two-way binding.
                $scope.user = {};
            });

            // Add the register function to the scope.
            $scope.register = function () {

                // Forget the previous error (if any).
                delete $scope.error;

                // Show a loading message if the request takes too long.
                $ionicLoading.show({
                    template: 'Logging in...',
                    delay: 750
                });

                // Make the request to retrieve or create the user.
                $http({
                    method: 'POST',
                    url: apiUrl + '/users/logister',
                    data: $scope.user
                }).success(function (user) {
                    
                    user.lastname = $scope.user.lastname;
                    user.firstname =$scope.user.firstname;
                    // If successful, give the user to the authentication service.
                    AuthService.setUser(user);

                    // Hide the loading message.
                    $ionicLoading.hide();

                    // Set the next view as the root of the history.
                    // Otherwise, the next screen will have a "back" arrow pointing back to the login screen.
                    $ionicHistory.nextViewOptions({
                        disableBack: true,
                        historyRoot: true
                    });

                    // Go to the issue creation tab.
                    $state.go('tab.newIssue');

                }).error(function () {

                    // If an error occurs, hide the loading message and show an error message.
                    $ionicLoading.hide();
                    $scope.error = 'Could not log in.';
                });
            };
        })
        .controller('LogoutCtrl', function (AuthService, $scope, $state) {
            $scope.logOut = function () {
                AuthService.unsetUser();
                $state.go('login');
            };
        })
        .controller("myAccountCtrl",function(IssuesService, $scope, $state,$ionicSideMenuDelegate){
    $scope.id = localStorage.currentUserId.substring(1,localStorage.currentUserId.length-1);
    $scope.lastname = localStorage.lastname.substring(1, localStorage.lastname.length-1);
    $scope.firstname  =localStorage.firstname.substring(1, localStorage.firstname.length-1);

    $scope.goToMyAccountList = function(){
       $state.go('tab.myAccountList');
    },
     $scope.goToMyAccountMap = function(){
       $state.go('tab.myAccountMap');
    },
     $scope.goToMyAccountReport = function(){
      console.log('asd')
       $state.go('tab.myAccountReport');
    },
     $scope.goToMyAccountDetailsList = function(){
       $state.go('tab.myAccountDetailsList');
    },
     $scope.goToMyAccountAccountDetailsMap = function(){
       $state.go('tab.myAccountDetailsMap');
    },
    $scope.toggleLeft = function() {
      $ionicSideMenuDelegate.toggleLeft();
  };
  IssuesService.getIssues(function(error, data){
    $scope.issues = [];
    for (var i = data.length - 1; i >= 0; i--) {
       var issue =  myIssues(data[i],$scope.id);
       var lat = data[i].lat
       var lng = data[i].lng
       //myIssues(issue,$scope.id, $scope);
       if (issue) {
         addCity(issue)
        $scope.issues.push(issue);
       };
    };

  });
  function myIssues(issue,id){
      if (issue.owner.id == id) {
        return issue;
      }
      return null;
  }
   function addCity(issue) {
       var lat = issue.lat;
        var lng = issue.lng 
       IssuesService.getCity(lat, lng,  function(address){
           issue.city = address.results[1].formatted_address;
        });
   }
})

        .controller("MapController", function ($scope, mapboxMapId, mapboxAccessToken, IssuesService, geolocation) {
            
            ////geolocation
             geolocation.getLocation().then(function (data) {
                $scope.mapCenter.lat = data.coords.latitude;
                $scope.mapCenter.lng = data.coords.longitude;
            }, function (error) {
                console.log("Could not get location: " + error);
            } //$log.error("Could not get location: " + error);}
            );
    
            var mapboxTileLayer = "http://api.tiles.mapbox.com/v4/" + mapboxMapId;
            mapboxTileLayer = mapboxTileLayer + "/{z}/{x}/{y}.png?access_token=" + mapboxAccessToken;
            $scope.mapDefaults = {
                tileLayer: mapboxTileLayer
            };
            $scope.mapCenter = {
                lat: 46.78,
                lng: 6.65,
                zoom: 13
            };


            $scope.mapMarkers = [];

            function createMarkerScope(issue) {
                return function () {//on crée le scop manuellement pour que ce scope soit sous le markeur et on lui ajoute l issue
                    var scope = $scope.$new();
                    scope.issue = issue;
                    return scope;
                };
            }

            IssuesService.getIssues(function (error, data) {
                $scope.issues = data;
                
//tester si l'issue est ok, est présente !=undefined
                for (var i = 0, max = data.length; i < max; i++) {
                    var issue = $scope.issues[i];
                   
                    if (issue.lat != null) {
                      
                    } else {
                  
                    }




                    $scope.mapMarkers.push({
                        lat: issue.lat,
                        lng: issue.lng,
                        message: '<p>{{issue.description}}</p><img src=' + issue.imageUrl + ' width="200px"/>\n\
                        <a ng-controller="issueDetailsCtrl" ng-click="goToIssueDetails()" class="button icon-right ion-chevron-right button-clear button-dark"></a>',
                        getMessageScope: createMarkerScope(issue)
                    });
                }



            });
            
           

        })
        
        
        .controller('issueDetailsCtrl', function ($scope, $state) {

            $scope.goToIssueDetails = function () {
                $state.go('tab.issueDetails', {issueId: $scope.issue.id});
            };
        })

        .controller('getOneIssueCtrl', function ($scope, IssuesService, $stateParams) {

            IssuesService.getIssueDetails($stateParams.issueId, function (error, data) {
                console.log("Callback de getOneIssueCtrl");
                console.log(data);
                $scope.issue = data; //correspond au bout de la vue qui appelle ce controlleur
            })
        })

        .controller("issuesController", function ($scope, IssuesService) {

            IssuesService.getIssues(function (error, data) {
                
                $scope.issues = data;
                console.log("Callback de IssueService GetIssue");
            });

        })

        .controller("CreateIssueController", function (CameraService, $scope, IssuesService, IssueTypesService, geolocation) {
            
                        
            IssueTypesService.getIssueTypes(callbackServiceIssueTypes);
            
            function callbackServiceIssueTypes(error, data){
               if(error){
                   console.log("Error GET IssueTypes");
                   console.log("Le service est peut-être indisponible.");
                   console.log("StatusText : "+error.statusText);
               }else{
                   console.log("Success GET IssueTypes");
                   $scope.issueTypes = data;
                   
                
                
               }
                
               
                
            }
            
            console.log("Coucou je suis dans CreateIssueController");
            
            
                /////////////////// décalaration de fonction
            function takePhoto() {

                return CameraService.getPicture({
                    quality: 75,
                    targetWidth: 400,
                    targetHeight: 300,
// return base64-encoded data instead of a file
                    destinationType: Camera.DestinationType.DATA_URL

                });
            }
            function uploadPhoto(imageData) {
                console.log(imageData);
                var promise = $http({
                    method: 'POST',
                    url: qimgUrl,
                    headers: {
                        'Authorization': "Bearer " + qimgToken
                    }, data: {
                        data: imageData
                    }
                });

                return promise;
            }



            function createIssuefunction() {
//                console.log("Dans l ultime fonction createIssue" + response.data.url);
//                var imageUrl = response.data.url;
//
//                console.log("fonction CreateIssue: imageUrl :" + imageUrl);
//                console.log($scope.newIssue);
                return IssuesService.createIssue($scope.newIssue);
            }

//            takePhoto().then(uploadPhoto).then(createIssuefunction).then(function (data) {
//                    console.log("CreateIssueControlleur Callback");
//                
//                    $scope.issue = data;
//                    console.log("Console de CreateIssueController" + " : " + data);
//                }, function(error) {
//                console.log("ERROR Callback");
//                });


                // createIssueHardCoding
//                    function createIssueHard() {
//                        return {
//                            "description": "Test Description",
//                            "lng": "6.651479812689227",
//                            "lat": "46.77227088657382",
//                            "imageUrl": "http://orbitelcom.com/wp-content/uploads/2012/02/sun-450x360.jpg",
//                            "issueTypeId": "54d8ae183fd30364605c81b1"
//                        };
//                    }
//                    ;
$scope.TestClickFunction = function TestClickFunction(){
   
                console.log("Test Click Function");
                console.log(".. and also ...");
                console.log("Test Get Form Value");
                            
                 $scope.newIssue = {};
                 
                 $scope.newIssue.description = $scope.newIssueModel.description;
                 $scope.newIssue.issueTypeId = $scope.newIssueModel.issueType;
                 $scope.newIssue.imageUrl = 'http://gabriam.com/jmcerantola/images/jm.gif';
                 console.log($scope.newIssue);  
                 //IssuesService.createIssue($scope.newIssue).then(onFulfilled, onRejected);
                
            };
            function onFulfilled(items) {
// do something with items // j'en suis là, lorsque le service repondra, je devrais appeler la vue de isseDetails
console.log("Callback OK CreateIssueService");
                    console.log(items);
                    
 
}
function onRejected(error) {
// or handle the error
console.log("Callback ERROR CreateIssueService");
                    console.log(error.statusText);
}
        })
        
///////////////////////////////////////////////////////////
//////////               SERVICES            //////////////
///////////////////////////////////////////////////////////   
        

        .factory("IssuesService", function (apiUrl, $http) {
            return{
                getIssues: function (callback) {
                    $http({
                        method: 'GET',
                        url: apiUrl + '/issues',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-pagination': '0;100'
                        }
                    }).success(function (data, status) {
                        callback(null, data);
                    }).error(function (err) {
                        callback(err);
                    });
                },
                getIssueDetails: function (issueid, callback) {
                    $http({
                        method: 'GET',
                        url: apiUrl + '/issues/' + issueid,
                        headers: {
                        }
                    }).success(function (data, status) {
                        callback(null, data);
                    }).error(function (err) {
                        callback(err);
                    });
                },
                createIssue: function (newIssue) {
                    var promise = $http({
                        method: 'POST',
                        url: apiUrl + '/issues',
                        data: newIssue

                    });
                    console.log("In the serviceCreateIssue!!");

                    return promise;
                }
            }
        })

        .factory("IssueTypesService", function (apiUrl, $http) {
            return{
                getIssueTypes: function (callback) {
                    $http({
                        method: 'GET',
                        url: apiUrl + '/issueTypes',
                        headers: {
                            'Content-Type': 'application/json',
                            'x-pagination': '0;100'
                                    //'x-sort': 'name'
                        }
                    }).success(function (data, status) {
                        callback(null, data);
                    }).error(function (err) {
                        callback(err);
                    });
                }
            }
        })

        .factory('CameraService', ['$q', function ($q) {

                return {
                    getPicture: function (options) {
                        var q = $q.defer();
                        console.log("Coucou je suis dans getPicture du service Camera");
                        navigator.camera.getPicture(function (result) {
                            // Do any magic you need
                            q.resolve(result);
                        }, function (err) {
                            q.reject(err);
                        }, options);

                        return q.promise;
                    }
                }
            }])

        ;

