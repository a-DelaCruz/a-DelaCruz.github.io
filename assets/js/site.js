$(document).ready(function () {
    $('.modal').modal();
    
    $('.list-pagination').Paginationwithhashchange2({

        // default settings
        pagingSelector: '.paging-nav',
        itemsPerPage: 5,
        initialPage: 1

    });
});
