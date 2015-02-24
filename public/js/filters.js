'use strict';

/* Filters */

angular.module('wordsFilters', [])
  
  .filter('lastcontent', function() {
    return function(arr) {
      if(arr.slice(-1)[0])
        return arr.slice(-1)[0].content;
      else
        return "";
    }
  })
  .filter('content', function() {
    return function(arr,i) {
      if(i>=0 && i<arr.length)
        return arr[i].content;
      else
        return "";
    }
  })

  .filter('adjoin', function() {
    return function(list,max) {
      return list.join(", ");
    }
  });