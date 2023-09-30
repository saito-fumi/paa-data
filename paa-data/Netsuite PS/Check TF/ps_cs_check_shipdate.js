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
 * 1.00		2021/06/20				Keito Imai		Initial Version
 * 
 */

define(['N/ui/message',
		'N/ui/dialog',
		'N/runtime',
		'N/record',
		'N/search'],
function(message, dialog, runtime, record, search){
	var globalCr = null;	//global変数としての currentRecord
	
	function pageInit(context){
		const currentRecord = context.currentRecord;	//currentRecordを取得
		globalCr = currentRecord;						//グローバル変数へ格納
	}
	function postSourcing(context){
	}
	function fieldChanged(context){
	}
	function saveRecord(context){
		const currentRecord = context.currentRecord;	//currentRecordを取得
		const shipDate = currentRecord.getValue({fieldId: 'shipdate'});
		//log.debug('shipDate', shipDate);
		//log.debug('typeof shipDate', typeof shipDate);
		//log.debug('date2strYYYYMMDDNum(shipDate)', date2strYYYYMMDDNum(shipDate));
		
		
		//const dd = currentRecord.getValue({fieldId: 'custbody_ns_delivery_date'});		//NS_納品日
		//log.debug('dd', dd);
		//log.debug('typeof dd', typeof dd);
		//log.debug('date2strYYYYMMDDNum(dd)', date2strYYYYMMDDNum(dd));
		
		const today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
		log.debug('today', today);
		log.debug('date2strYYYYMMDDNum(today)', date2strYYYYMMDDNum(today));
		
		var mes = '';
		
		//if(!isEmpty(dd) && date2strYYYYMMDDNum(today) >= date2strYYYYMMDDNum(dd)){
		//	mes = mes + 'NS_納品日が本日または本日以前です。\n';
		//}
		
		if(!isEmpty(shipDate) && date2strYYYYMMDDNum(today) >= date2strYYYYMMDDNum(shipDate)){
			mes = mes + '出荷日が本日または本日以前です。\n';
		}
		var nd = new Date();
		if(!isEmpty(shipDate) && date2strYYYYMMDDNumOver15(nd) >= date2strYYYYMMDDNum(shipDate)){
			mes = mes + '連携時刻を過ぎています。出荷日を確認して下さい。\n';
		}
		
		if(!isEmpty(mes)){
			mes = mes + '保存してよろしいですか？';
			return confirm(mes);
		}
		return true;
	}
	////////////////////
	//Add custom functions
	
	//空値判定
	function isEmpty(valueStr){
		return (valueStr === null || valueStr === '' || valueStr === undefined);
	}
	
	//日付を yyyy/MM/dd 形式に変換して返却
	function date2strYYYYMMDD(d){
		return d.getFullYear() + '/' + (('00' + (d.getMonth() + 1)).slice(-2)) + '/' + ('00' + d.getDate()).slice(-2);
	}
	
	//日付を yyyy/M/d 形式に変換して返却
	function date2strYYYYMD(d){
		return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
	}
	
	//日付を yyyyMMdd 形式の数値へ変換して返却
	function date2strYYYYMMDDNum(d){
		d = new Date(d.getTime() + 9 * 60 * 60 * 1000);
		return (d.getFullYear() + (('00' + (d.getMonth() + 1)).slice(-2)) + ('00' + d.getDate()).slice(-2)) * 1;
	}
	
	//日付を yyyyMMddhh 形式の数値へ変換して返却、15時過ぎていたら日付加算
	function date2strYYYYMMDDNumOver15(d){
		log.debug('d', d);
		//d = new Date(d.getTime() + 9 * 60 * 60 * 1000);
		
		//('00' + d.getHours()).slice(-2)) * 1
		
		var hour = d.getHours();
		log.debug('hour', hour);
		
		if(hour >= 15){
			d = new Date(d.getTime() + 24 * 60 * 60 * 1000);
		}
		
		return (d.getFullYear() + (('00' + (d.getMonth() + 1)).slice(-2)) + ('00' + d.getDate()).slice(-2));
	}
	
	//ログ出力
	function logW(str1, str2){
		console.log(str1 + ': '+str2);
		log.audit(str1, str2);
	}
	return {
		pageInit: pageInit,
//		lineInit: lineInit,
		fieldChanged: fieldChanged,
		postSourcing: postSourcing,
		saveRecord: saveRecord
	};
});