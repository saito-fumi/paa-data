/**
 *@NApiVersion 2.x
 *@NScriptType Restlet
 */
define(['N/search'],
    function(search) {
        // Get a standard NetSuite record
        function _get(context) {            
            var myTransactionSearch = search.load({
                id: context.searchid
            });
            var pagedData = myTransactionSearch.runPaged({
                pageSize: 1000
                });
            var results = pagedData.fetch({
                index: context.index
            })
            return JSON.stringify(results);
        }
        return {
            get: _get
        };
    });