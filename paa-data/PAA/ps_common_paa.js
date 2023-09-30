/**
 * @NApiVersion 2.x
 * @NModuleScope Public
 */
define(['N/search', 'N/record', 'N/format'],

function(search, record, format) {
    /**
     * 日本の日付を取得する
     * 
     * @returns 日本の日付
     */
    function getJapanDate() {

        var now = new Date();
        var offSet = now.getTimezoneOffset();
        var offsetHours = 9 + (offSet / 60);
        now.setHours(now.getHours() + offsetHours);

        return now;
    }

    /**
     * 年月を取得する
     * 
     * @param {Object} str 日付
     * @returns フォーマット：YYYYMM
     */
    function getYearMonth(str) {

        var now = new Date(str);
        var offSet = now.getTimezoneOffset();
        var offsetHours = 9 + (offSet / 60);
        now.setHours(now.getHours() + offsetHours);

        return '' + now.getFullYear() + now.getMonth();
    }

    function StringFormat(str, arguments) {
        if (str.length === 0) {
            return str;
        }
        for (var i = 0; i < arguments.length; i++) {
            str = str.replace(new RegExp("\\{" + i + "\\}", "g"), arguments[i]);
        }
        return str;

    }

    /**
     * 検索メソッド
     * 
     * @param {Object} searchType 検索種類
     * @param {Object} searchFilters 検索条件
     * @param {Object} searchColumns 検索項目
     */
    function createSearch(searchType, searchFilters, searchColumns) {
    	
        var resultList = [];
        var resultIndex = 0;
        var resultStep = 1000;

        var objSearch = search.create({
            type : searchType,
            filters : searchFilters,
            columns : searchColumns
        });
        var objResultSet = objSearch.run();

        do {
            var results = objResultSet.getRange({
                start : resultIndex,
                end : resultIndex + resultStep
            });

            if (results.length > 0) {
                resultList = resultList.concat(results);
                resultIndex = resultIndex + resultStep;
            }
        } while (results.length > 0);

        return resultList;
    }


    function isDateString(date, fh) {
        if (!date) {
            return false;
        }
        var dateItems = date.split(fh);
        if (dateItems.length !== 3) {
            return false;
        }
        var pattern = new RegExp("[0-9]+");
        if (!pattern.test(dateItems[0]) || !pattern.test(dateItems[1]) || !pattern.test(dateItems[2])) {
            return false;
        }

        if (dateItems[0].length !== 4 || parseInt(dateItems[1]) > 12 || parseInt(dateItems[1]) <= 0 || parseInt(dateItems[2]) > 31
                || parseInt(dateItems[2]) <= 0) {
            return false;
        }

        return true;
    }

	function isEmpty(valueStr){
		return (valueStr === null || valueStr === '' || valueStr === undefined);
	}

    return {
        getJapanDate : getJapanDate,
        getYearMonth:getYearMonth,
        StringFormat:StringFormat,
        createSearch:createSearch,
        isDateString:isDateString,
        isEmpty:isEmpty,
    };

});
