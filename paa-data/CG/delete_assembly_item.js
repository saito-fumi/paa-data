/**
 *@NApiVersion 2.x
 *@NScriptType ScheduledScript
 */

 define(['N/search', 'N/record', 'N/runtime', 'N/format', 'N/file'],
 function (search, record, runtime, format, file) {

	 function main() {

		 try{
			var fileObj = file.load({
				id: 'SuiteScripts/CG/delete_assembly_item.csv'
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
            	var assemblyitemid = parsedData[i][0];
				l('assemblyitem.id = ' + assemblyitemid);
                try {
                	var result = record.delete({
                		type: record.Type.ASSEMBLY_ITEM,
                  		id: assemblyitemid,
               		});
					l('record.deleted = ' + result);
                } catch(e){
                  l('error = ' + e);
                }
			}
			l('delete_assemblyitem_succeeded');
		 } catch (e) {
           l('>> delete_assemblyitem!!!! ' + e);
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
