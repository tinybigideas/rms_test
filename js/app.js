//  Task
//   1. Create a visually appealing display for the data in ctrl.comments using js+scss/css. 
//      Look up whatever you would like, but the final product must not rely on any imports not 
//      present at the start. 

//   #1 is worth a **lot**, well executed it is all that is necessary to succeed. 

//  Bonus tasks in order of value:
//   2. use animations or transitions with or without ngAnimate
//   3. mock and handle some error output from the initial $http request
//   4. write a directive that encapsulates some of the functionality
//   5. write a custom filter to format the output
//   6. add a search bar to filter the results by the search term
//   7. use a form with a custom validator
//   8. get the comments page to load instantly when the limit is 4. ex: 
//      commentService.getComments(4) will give you a list of 8000 comments.

/* 
    Comments:

    1.  I created a "Sentiment analysis" mobile first interface to use the provided data in an 
        interesting way. Changed a bunch of code, but no imports.
    
    2.  I'm a fan of using animations sparingly when needed. I didn't go over the top, or show off 
        any wacky animations. Simple fading, with a little cascading fade on ng-repeat items. No 
        use of ngAnimate directly as we can achieve it all through CSS and the appended class names.

    3.  Added error handling for our $http request. Simply show a zero data alert.
    
    4.  I didn't feel a directive would work anywhere besides the "comment item". This would 
        separate this for us to add further complexity later.

    5.  I added several filters: searchEmailFilter, sentimentFilter, and percentageFilter. The first 
        two allow us to efficiently alter a copied comments array to our filtered choice. While the 
        other formats our percentage of sentiment.

    6.  I added a search bar. To allow its efficient use, I didn't append the query directly to the 
        ng-repeat (its notoriously inefficient!). I instead used the searchEmailFilter to build a 
        new array to replace to current. Also, added validation and debouncing to prevent useless 
        calls. 

    7.  Added a simple "Add new comment" form. Custom regex validator on email to only allow 
        @rms.com email addresses. Disabled HTML5 validation to force our custom one instead.

    8.  Simple limit chunking. Could be smoother here, however, the page is instantly shown while 
        other nodes are created incrementally. Ideally would include a plugin to replace ng-repeat 
        directive with a virtualising directive instead. Only show nodes available to the screen. 
        The DOM is slow, and in this case, we only have a max of ~24 comments that show at once. 
        Therefore, that's all we should render out of the 8000. Using bind one syntax (::) helps 
        too.
    
    9.  I was looking to rewrite this in Angular 2/4 to show the progression of the framework. The 
        changes are, in my opinion, amazing. I would like to have shown that, but I run out of time.
    
*/

function commentService($http) {
    let root = 'https://jsonplaceholder.typicode.com';
    
    this.getComments = function(limit) {
        let url = `${root}` + '/comments';
        
        return $http.get(url).then((r) => {
            for (let i = 0; i < limit; i++) {
                r.data = r.data.concat(r.data);
            }

            return r;
        }, function(error) {
            error.data = [];
            console.error('Error!:', error);
            return error;
        });
    };
};

function mainCtrl($scope, $timeout, $filter, CommentService) {

    // state
    $scope.state = {
        loading: true,
        comments: [],
        filteredComments: [],
        sentiment: {
            happy: 0,
            sad: 0
        },
        filterBySentiment: null,
        searchQuery: {
            email: ''
        },
        displayLimit: 30,
        emailPattern: /^[a-z]+[a-z0-9._]+@rms.com$/,
        extraStuff: false
    };
    
    // get comments
    CommentService.getComments(0).then(function(response) {

        // set data
        $scope.state.comments = response.data;

        // mock sentiment data for extra interest
        angular.forEach($scope.state.comments, function(item) {
            item.sentiment = ((Math.floor(Math.random() * 10) + 1) > 5) ? 'happy' : 'sad';
            $scope.state.sentiment[item.sentiment]++;
        });

        // set copy of data
        $scope.state.filteredComments = angular.copy($scope.state.comments);

        // chunk data for efficient display
        let delay = 10;
        for (var i = $scope.state.comments.length - 1; i >= 0; i--) {
            $timeout(function() {
                $scope.state.displayLimit++;
            }, (delay += 10));
        }
        angular.copy(response.data);

        // load state
        $scope.state.loading = false;
        console.log($scope.state.comments.length);
    }, function(error) {
        console.error('Error!', error);
    });

    // handle search on change
    $scope.searchEmailFilter = function(query) {
        if (angular.isDefined(query) && query.length > 2) {
            $scope.state.filterBySentiment = null;
            $scope.state.filteredComments = $filter('searchEmailFilter')($scope.state.comments, query);
        } else {
            $scope.state.filteredComments = angular.copy($scope.state.comments);
        }
    };

    // reset data
    $scope.resetData = function() {
        $scope.state.filteredComments = angular.copy($scope.state.comments);
        $scope.state.searchQuery.email = '';
        $scope.state.filterBySentiment = null;
    };

    // handle filter by sentiment click
    $scope.filterBySentiment = function(type) {
        if (angular.isDefined(type)) {
            $scope.resetData();
            $scope.state.filterBySentiment = type;
            $scope.state.filteredComments = $filter('sentimentFilter')($scope.state.comments, type);
        }
    };

    // handle add comment click
    $scope.addComment = function(isValid, comment, form) {
        if (isValid) {
            comment.sentiment = ((Math.floor(Math.random() * 10) + 1) > 5) ? 'happy' : 'sad';
            $scope.state.comments.unshift(comment);
            $scope.resetData();
            form.$setPristine();
        }
    };

    // toggle showing other stuff on filter bar
    $scope.toggleExtraStuff = function() {
        $scope.state.extraStuff = !$scope.state.extraStuff;
    };
};

// search email filter
function searchEmailFilter() {
    return function(array, query) {
        let filteredArray = [];

        angular.forEach(array, function(item) {
            if (angular.isDefined(item.email) && item.email.toLowerCase().indexOf(query) > -1) {
                filteredArray.push(item);
            }
        });

        return filteredArray;
    };
};

// sentiment filter
function sentimentFilter() {
    return function(array, type) {
        let filteredArray = [];

        angular.forEach(array, function(item, i) {
            if (angular.isDefined(item.sentiment) && item.sentiment === type) {
                filteredArray.push(item);
            }
        });

        return filteredArray;
    };
};

// percentage filter
function percentageFilter() {
    return function(item, array) {
        return item = parseFloat(((item / array.length) * 100)).toFixed(1) + '%';
    };
};

var app = angular.module('rmsApp', ['ngAnimate'])
    .service('commentService', ['$http', commentService])
    .controller('mainCtrl', ['$scope', '$timeout', '$filter', 'commentService', mainCtrl])
    .filter('searchEmailFilter', searchEmailFilter)
    .filter('sentimentFilter', sentimentFilter)
    .filter('percentageFilter', percentageFilter)
    .directive('commentItem', [function () {
        return {
            restrict: 'E',
            template: 
                `<div class="b-thing animate-fade-cascade">
                    <div class="b-thing__content">
                        <div class="b-thing__user">
                            <div
                                class="b-sentiment"
                                ng-class="{'b-sentiment--happy': comment.sentiment === 'happy', 
                                'b-sentiment--sad': comment.sentiment === 'sad'}"
                                ng-bind="(comment.sentiment === 'happy') ? ':)' : ':('">
                            </div>

                            <div class="b-thing__email email-text">
                                {{comment.email}}
                            </div>
                        </div>
                        <p class="b-thing__body">
                            {{comment.body}}
                        </p>
                    </div>
                </div>`,
            replace: true,
            scope: {
                comment: '=item'
            },
            link: function (scope, element, attrs) {

            }
        };
    }]);