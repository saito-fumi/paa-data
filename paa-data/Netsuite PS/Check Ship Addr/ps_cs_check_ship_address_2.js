/**
 * @NApiVersion 2.x
 * @NScriptType ClientScript
 * @NModuleScope Public
 * @author Keito Imai
 */
 /**
 * Module Description
 *
 * Version	Date					Author			Remarks
 * 1.00		2022/07/12				Keito Imai		Initial Version
 * 
 */

define(['N/ui/message',
		'N/ui/dialog',
		'N/runtime',
		'N/record',
		'N/search'],
function(message, dialog, runtime, record, search){
	function pageInit(context){
	}
	function saveRecord(context){
		try{
			const currentRecord = context.currentRecord;	//currentRecordを取得
			const wmsCompFlg = currentRecord.getValue({		//Celigo経由判定
				fieldId: 'custbody_ns_wms_compflg'
			});
			if(wmsCompFlg){
				//Celigo経由の場合
				
				//処理を抜ける
				return true;
			}
			
			const cf = currentRecord.getValue({fieldId: 'customform'});
			log.debug('cf', cf);
			console.log('cf: ' + cf);
			
			//カスタムフォームチェック
			if(cf != 217){
				//PAA - 注文書（第一貨物用）以外の場合
				
				//処理を抜ける
				return true;
			}
			
			const shipAddressList = currentRecord.getValue({fieldId: 'shipaddresslist'});
			log.debug('shipAddressList', shipAddressList);
			console.log('shipAddressList: ' + shipAddressList);
			
			if(shipAddressList == -2){
				//配送先が「カスタム」の場合
				
				//確認ダイアログを表示
				return confirm('配送先の住所が「カスタム」になっています。正しい配送先を再選択してください。\n再選択する場合は「キャンセル」を、カスタムのままで保存する場合は「OK」をクリックしてください。');
			}else{
				//処理を抜ける
				return true;
			}
			
			return true;
		}catch(e){
			console.log(e);
			log.error('e', e);
			return true;
		}
	}
	//空値判定
	function isEmpty(valueStr){
		return (valueStr === null || valueStr === '' || valueStr === undefined);
	}
	return {
		saveRecord: saveRecord
	};
});