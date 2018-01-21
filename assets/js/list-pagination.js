/*
*  by cpbaumann
*/

(function ( $, window, document, undefined ) {

    "use strict";

    var pluginName = 'Paginationwithhashchange2',
        defaults = {
            nextSelector: '.next',
            prevSelector: '.prev',
            counterSelector: '.counter',
            pagingSelector: '.paging-nav',
            itemsPerPage: 5,
            initialPage: 1
        };

    var Range = (function () {

        var i = 0,
            minValue = 0,
            maxValue = 5;

        return {
            get: function(){
                return i;
            },
            set: function (val) {
                i = val;
            },
            setborders: function (min, max) {
                minValue = min;
                maxValue = max;
            },
            plus: function () {
                return (i < maxValue) ? ++i : i = minValue;
            },
            minus: function () {
                return (i > minValue) ? --i : i = maxValue;
            }
        };
    })();


    var Hash = (function () {

        return {
            protocol: '//',
            host: window.location.host,
            pathname: window.location.pathname,
            search: window.location.search,
            set: function (hash) {
                window.location = this.protocol +
                    this.host +
                    this.pathname +
                    this.search +
                    '#' + hash;
            },
            get: function () {
                return window.location.hash.replace('#', '');
            }
        };
    })();


    function Paginationwithhashchange2( element, options ) {

        this.element = element;
        this.options = $.extend( {}, defaults, options) ;
        this._defaults = defaults;
        this._name = pluginName;
        this.init();
    }

    Paginationwithhashchange2.prototype.init = function () {
        
        /*
        * Vars
        */
        var next = $(this.options.nextSelector),
            prev = $(this.options.prevSelector),
            counter = $(this.options.counterSelector),
            pagingSelector = this.options.pagingSelector,
            itemsPerPage = this.options.itemsPerPage,
            items = $(this.element),
            numItems = items.children().length,
            numPages = Math.ceil(numItems / itemsPerPage),
            maxValue = numPages,
            minValue = 1,
            initValue = this.options.initialPage,
            page;

        /*
        * Function
        */
        function plus() {

            page = Range.plus();
            counter.html(page);
            Hash.set(page);
            showPage(page);
            setActiveState(page);
        }

        function minus() {

            page = Range.minus();
            counter.html(page);
            Hash.set(page);
            showPage(page);
            setActiveState(page);
        }

        function pageNav() {
        
            var ListWrapper = '<ul></ul>',
                ListElements = '',
                i;

            for (i = 1; i <= maxValue; i += 1) {
                ListElements += '<li><a href="#' +
                    i +
                    '">' +
                    i +
                    '</a></li>';
            }

            $(ListElements)
                .appendTo(
                    $(ListWrapper)
                        .appendTo(pagingSelector)
                    );
        }   
    
        function showPage (page) {
        
            items.children().hide();
            var i,
                s = (page - 1) * itemsPerPage,
                max = page * itemsPerPage;

            for (i = s; i < max; i += 1) {
               items.children().eq(i).show();
            }
        }

        function setInitalPage () {

            var h = Hash.get();
            return (h  === "") ? initValue : h;
        }

        function setActiveState (page) {

            var p = page;
            $(pagingSelector).each(function () {
                $(this).find('li')
                .removeClass('active')
                    .eq(p - 1)
                    .addClass('active');
           });
       }

        function initital () {

            page = setInitalPage();
            Hash.set(page);
            Range.setborders(minValue, maxValue);
            Range.set(page);

            counter.html(page);
            pageNav();
            showPage(page);
            setActiveState(page);
        }

        function pageevent (e) {

            e.preventDefault();
            page = this.hash.replace('#', '');
            Hash.set(page);
            Range.set(page);
            counter.html(page);
            showPage(page);
            setActiveState(page);
        }

        /*
        * Events, init
        */
        initital();
        next.on('click', plus);
        prev.on('click', minus);
        $(pagingSelector).on('click', 'a', pageevent);
    };

    $.fn[pluginName] = function ( options ) {
        return this.each(function () {
            if (!$.data(this, 'plugin_' + pluginName)) {
                $.data(this, 'plugin_' + pluginName, 
                new Paginationwithhashchange2( this, options ));
            }
        });
    };

})( jQuery, window, document );