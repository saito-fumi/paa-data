/**
 *@NApiVersion 2.x
 *@NScriptType ScheduledScript
 */

 define(['N/search', 'N/record', 'N/runtime', 'N/format', 'N/file'],
 function (search, record, runtime, format, file) {

	 function main() {

		 try{
			var fileObj = file.load({
				id: 'SuiteScripts/CG/delete_purchasecontract.csv'
			});
			var contents;
			if (fileObj.size < 10485760){
				contents = fileObj.getContents();
			}
			var parsedData = contents.split(/\n/g);
			for (var i = 0; i < parsedData.length; i++) {
				parsedData[i] = parsedData[i].split(",");
			}

			if(parsedData.length<2){
				return;
			}

			for (var i = 1; i < parsedData.length; i++) {
            	var purchasecontractId = parsedData[i][0];
				l('purchasecontract.id = ' + purchasecontractId);
                try {
                	var result = record.delete({
                		type: record.Type.PURCHASE_CONTRACT,
                  		id: purchasecontractId,
               		});
					l('record.deleted = ' + result);
                } catch(e){
                  l('error = ' + e);
                }
			}
			l('delete_purchasecontract_succeeded');
		 } catch (e) {
           l('>> delete_purchasecontract!!!! ' + e);
		 }
		 function l(str) {
			 log.debug({
				 title: str,
				 details: str
			 });
		 }
	 }
	 return {
		 execute: main
	 };
 });
