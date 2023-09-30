/**
 *@NApiVersion 2.x
 *@NScriptType ScheduledScript
 */

 define(['N/search', 'N/record', 'N/runtime', 'N/format', 'N/file'],
 function (search, record, runtime, format, file) {

	 function main() {

		 try{
			var fileObj = file.load({
				id: 'SuiteScripts/CG/delete_bom.csv'
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
            	var id = parsedData[i][0];
				l('id = ' + id);
                try {
                	var result = record.delete({
                		type: record.Type.BOM,
                  		id: id,
               		});
					l('record.deleted = ' + result);
                } catch(e){
                  l('error = ' + e);
                }
			}
			l('delete_bom_succeeded');
		 } catch (e) {
           l('>> delete_bom!!!! ' + e);
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
