/**
* @NApiVersion 2.x
* @NScriptType ClientScript
* @NModuleScope Public
 */
 define(['N/log', 'N/error', 'N/record', 'N/search'],
 function (log, error, record, search) {
function saveRecord(context) {
            var currentRecord = context.currentRecord;			

			//納品日を取得
			const deliDate= currentRecord.getValue({fieldId: 'custbody_ns_delivery_date'});
			log.debug('deliDate', deliDate);

			for(var i = 0; i < currentRecord.getLineCount({sublistId: 'item'}); i++){
		
						item = null;
						
						item =  currentRecord.getSublistValue({
							sublistId: 'item',
							fieldId: 'item',
							line: i
						});
						
						log.debug('item', item);

						//製造日を取得
						mfg = currentRecord.getSublistValue({
							sublistId: 'item',
							fieldId: 'custcol_ns_mfg_date_memo',
							line: i
						});  

						
						log.debug('deliDate', deliDate);
						log.debug('mfg', mfg);

						//製造日と納品日を比較
						if(deliDate-mfg < 0){
							alert('NS_製造日(MEMO)がNS_納品日より、未来日付となった明細行があり、保存できません。ご確認の上、再度入力してください。');
							return false;               

                        }
						if(i==currentRecord.getLineCount({sublistId:'item'})-1){
							return true;
						}		
		}
}
	return {
		saveRecord: saveRecord
			};
    });