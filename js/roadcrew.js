/*
 *  Copyright 2012-2013 Christian Grobmeier
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing,
 *  software distributed under the License is distributed
 *  on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
 *  either express or implied. See the License for the specific
 *  language governing permissions and limitations under the License.
 */
function RoadcrewError(message, code, rootCause) {
    this.name = "RoadcrewError";
    this.message = message || "An error has occured";
    this.code = code || "1";
    this.rootCause = rootCause || null;
}

RoadcrewError.prototype = new Error();
RoadcrewError.prototype.constructor = RoadcrewError;

function Roadcrew() {
   $('[data-rc-partial]').addClass("rc-unloaded-partial");

   this.active = $($('.start')[0]);
   this.start = "#" + this.active.attr('id');
   this.active.css('display', 'block');

   $(window).bind('popstate', $.proxy(this, 'back'));
   $(document).on('click', "a", $.proxy(this, 'goto'));
    $(document).on('click', "button[data-target]", $.proxy(this, 'goto'));

    // In page templates
    $.each($('.template-ref'), function (index, value) {
        var elem = $(value);
        var target = elem.attr("data-target");
        if (target !== undefined) {
            elem.html($("#" + target).html());
        }
    });
}

Roadcrew.prototype = {
   path : [],
   interceptor : {},
   globalErrorHandler : null,
   errorHandler : {}
};

Roadcrew.prototype.intercept = function (url, interceptor, errorHandler) {
    this.interceptor[url] = interceptor;
    if(errorHandler !== null && errorHandler !== undefined) {
        this.errorHandler[url] = errorHandler;
    }
};

Roadcrew.createDispatcher = function (target, url) {
   var rd = new RoadcrewDispatcher(target, url);
   return function() {
      rd.dispatch();
   };
};

Roadcrew.prototype.goto = function (event, data) {
   var url = null;
   if(typeof (event) === "string") {
        url = event;
   } else {
console.log(event);
console.log(data);
      if (event.target.nodeName == 'A' || event.target.nodeName == 'BUTTON') {
        url = event.target.getAttribute('data-target');
      } else if($(event.target).parent().prop("tagName") == 'BUTTON' ) {
        url = $(event.target).parent().attr('data-target');
      }
   }

   if (url === undefined || url === null) {
       return;
   }

   event.preventDefault();

   this.path.push(url);

   var page = $(url);
   if (page.hasClass("rc-unloaded-partial")) {
       page.load(page.attr("data-rc-partial"));
       page.removeClass("rc-unloaded-partial");
   }

   var interceptor = this.interceptor[url];

   if(interceptor !== undefined) {
       try {
           var dispatcher = Roadcrew.createDispatcher(this, page);
           interceptor(dispatcher, data);
       } catch (error) {
           var errorHandler = this.errorHandler[url];
           if(errorHandler === undefined || errorHandler === null) {
               if(this.globalErrorHandler !== null) {
                   this.globalErrorHandler(error);
               }
           } else {
               errorHandler(error);
           }
       }
   } else {
      this.flip(page);
   }
};

Roadcrew.prototype.flip = function (page) {
   this.active.css('display','none');
   this.active = this.verifyPage(page);
   this.active.css('display','block');
};

Roadcrew.prototype.fadeIn = function (page) {
   this.active.css('display','none');
   this.active = this.verifyPage(page);
   this.active.fadeIn();
};

Roadcrew.prototype.verifyPage = function(page) {
    if( typeof (page) === "string") {
        return $(page);
    }
    return page;
};

Roadcrew.prototype.back = function(event) {
   if(this.path.length == 0) {
      return;         
   } else if(this.path.length == 1) {
      this.flip(this.start);
   } else {
      var url = this.path[this.path.length - 2];
      this.flip(url);   
   } 
   this.path.pop();
};

function RoadcrewDispatcher(target, page) {
    this.dispatch = function() {
        target.flip(page);
    };
}