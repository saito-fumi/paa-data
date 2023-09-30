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
 * 1.00		2022/03/04				Keito Imai		Initial Version
 * 
 */

define(['N/ui/message',
		'N/ui/dialog',
		'N/runtime',
		'N/record',
		'N/search',
		'N/url',
		'./moment'],
function(message, dialog, runtime, record, search, url, moment){
	const zeroEntityArray = ['2874', '2875', '2876'];
	function pageInit(context){
		const currentRecord = context.currentRecord;	//currentRecordを取得
		const mode = context.mode;						//モードを取得
		
		if(mode === 'create' || mode === 'copy'){
			//新規作成時もしくはコピー時であれば
			
			//NS_WMS指示フラグをデフォルトでON
			currentRecord.setValue({fieldId: 'custbody_ns_wms_orderflg', value: true, ignoreFieldChange: false});
			
			//NS_納品日をデフォルトで空値
			currentRecord.setValue({fieldId: 'custbody_ns_delivery_date', value: null, ignoreFieldChange: false});
			
			//NS_WMS_出庫予定日をデフォルトで空値
			currentRecord.setValue({fieldId: 'custbody_ns_wms_shipdate', value: null, ignoreFieldChange: false});
			
			const createdfrom = currentRecord.getValue({fieldId: 'createdfrom'});	//作成元
			
			if(!isEmpty(createdfrom)){
				//作成元が空値でなければ
				
				var createdfromForm = null;
				try{
					//作成元トランザクションのフォームを取得
					createdfromForm = search.lookupFields({
						type: search.Type.SALES_ORDER,
						id: createdfrom,
						columns: ['customform']
					}).customform[0].value;
					
					log.debug('createdfromForm', createdfromForm);
					console.log('createdfromForm: ' + createdfromForm);
					
					if(createdfromForm == 170){
						//作成元注文書のフォームが「PAA - 注文書（リテール販促用）」であれば
						
						//締め請求書に含めるをデフォルトでOFF
						currentRecord.setValue({fieldId: 'custbody_4392_includeids', value: false, ignoreFieldChange: false});
					}
				}catch(e){
					log.debug('e', e);
					console.log(e);
				}
			}
		}
		
		logW('mode', mode);
		const entity = currentRecord.getValue({fieldId: 'entity'});			//顧客
		logW('entity', entity);
		logW('zeroEntityArray.indexOf(entity)', zeroEntityArray.indexOf(entity));
		if(context.mode === 'copy'){
			if(zeroEntityArray.indexOf(entity) >= 0){
				const lineCount = currentRecord.getLineCount({sublistId: 'item'});
				logW('lineCount', lineCount);
				
				for(var i = 0; i < lineCount; i++){
					currentRecord.selectLine({sublistId: 'item',line: i});
					currentRecord.setCurrentSublistValue({
						sublistId: 'item',
						fieldId: 'rate',
						value: 0,
						ignoreFieldChange: false
					});
					currentRecord.commitLine({sublistId: 'item'});
				}
			}
		}
		
	}
	function fieldChanged(context){
		try{
			const currentRecord = context.currentRecord;	//currentRecordを取得
			const fieldName = context.fieldId;
			const sublistName = context.sublistId;
			
			log.debug('fieldName', fieldName);
			console.log('fieldName: ' + fieldName);
			
			if(fieldName === 'custbody_ns_delivery_date' || fieldName === 'entity'){
				//顧客
				const customer = currentRecord.getValue({fieldId: 'entity'});
				console.log('customer:' + customer);
				
				//NS_納品日
				const custbody_ns_delivery_date = currentRecord.getValue({fieldId: 'custbody_ns_delivery_date'});
				console.log('custbody_ns_delivery_date:' + custbody_ns_delivery_date);
				
				var closingDate = null;
				
				if(!isEmpty(custbody_ns_delivery_date)){
					//NS_納品日が空じゃなければ
					
					closingDate = calculateClosingDate(customer, custbody_ns_delivery_date);	//締日：NS_納品日から計算された顧客の締日
				}
				
				if(!isEmpty(closingDate)){
					//締日が空値でなければ
					
					//締日をセット
					currentRecord.setValue({fieldId: 'custbody_suitel10n_inv_closing_date', value: closingDate, ignoreFieldChange: false});
				}
			}
			/*
			if(sublistName === 'item' && fieldName !== 'rate'){
				const entity = currentRecord.getValue({fieldId: 'entity'});			//顧客
				if(zeroEntityArray.indexOf(entity) >= 0){
					setSublistValue(currentRecord, 'item', 'price', -1);			//価格水準
					setSublistValue(currentRecord, 'item', 'rate', 0);					//レート
					setSublistValue(currentRecord, 'item', 'price', -1);			//価格水準
				}
			}
			*/
		}catch(e){
			log.debug('e', e);
			console.log(e);
		}
	}
	function postSourcing(context){
		const currentRecord = context.currentRecord;	//currentRecordを取得
		const sublistName = context.sublistId;
		const sublistFieldName = context.fieldId;
		const line = context.line;
		
		if(sublistName === 'item' && sublistFieldName === 'item'){
			const entity = currentRecord.getValue({fieldId: 'entity'});			//顧客
			if(zeroEntityArray.indexOf(entity) >= 0){
				setSublistValue(currentRecord, 'item', 'price', -1);			//価格水準
				setSublistValue(currentRecord, 'item', 'rate', 0);					//レート
				//setSublistValue(currentRecord, 'item', 'price', -1);			//価格水準
			}
		}
	}
	function saveRecord(context){
		const currentRecord = context.currentRecord;	//currentRecordを取得
		const entity = currentRecord.getValue({fieldId: 'entity'});			//顧客
		logW('entity', entity);
		logW('zeroEntityArray.indexOf(entity)', zeroEntityArray.indexOf(entity));
		
		if(zeroEntityArray.indexOf(entity) >= 0){
			const lineCount = currentRecord.getLineCount({sublistId: 'item'});
			logW('lineCount', lineCount);
			var rate = null;
			var notZeroFlg = false;
			for(var i = 0; i < lineCount; i++){
				rate = currentRecord.getSublistValue({
					sublistId: 'item',
					fieldId: 'rate',
					line: i
				});
				
				if(rate != 0){
					notZeroFlg = true;
					break;
				}
			}
		}
		
		if(notZeroFlg){
			return confirm('単価が0円ではないアイテムが入力されています。');
		}else{
			return true;
		}
	}
	function lineInit(context){
		const currentRecord = context.currentRecord;	//currentRecordを取得
		const entity = currentRecord.getValue({fieldId: 'entity'});			//顧客
		if(zeroEntityArray.indexOf(entity) >= 0){
			setSublistValue(currentRecord, 'item', 'price', -1);			//価格水準
			setSublistValue(currentRecord, 'item', 'rate', 0);					//レート
		}
	}
	////////////////////
	//Add custom functions
	
	//空値判定関数
	function isEmpty(valueStr){
		return (valueStr === null || valueStr === '' || valueStr === undefined);
	}
	
	//ログ出力
	function logW(str1, str2){
		console.log(str1 + ': '+str2);
		log.debug(str1, str2);
	}
	//サブリストの値をセット
	function setSublistValue(cr, sublistId, fieldId, value){
		try{
			cr.setCurrentSublistValue({
				sublistId: sublistId,
				fieldId: fieldId,
				value: value,
				ignoreFieldChange: false
			});
		}catch(e){
			log.error('e', e + ': ' + fieldId);
		}
	}
	
	//締日取得関数
	function calculateClosingDate(entityId, baseDate){
		log.debug("calculateClosingDate BEGIN");
		try{
			const entityObj = record.load({
				type: record.Type.CUSTOMER,
				id: entityId,
				isDynamic: true,
			});
			/*
			const closingDate = entityObj.getSublistValue({
				sublistId: 'recmachcustrecord_suitel10n_jp_pt_customer',
				fieldId: 'custrecord_suitel10n_jp_pt_closing_day',
				line: 0
			});
			*/
			
			var closingDate = null;
			const sjResultSet = search.create({
				type: 'customrecord_suitel10n_jp_payment_term',	//支払条件
				columns: [{							//取得対象項目
					name: 'custrecord_suitel10n_jp_pt_closing_day',
				}],
				filters: [							//ANDによる取得条件(フィルター)
					{	name: 'custrecord_suitel10n_jp_pt_customer',
						operator: search.Operator.IS,
						values: entityId
					}
				]
			})
			.run();
			log.audit('sjResultSet', sjResultSet);
			//検索実行結果をループ
			sjResultSet.each(
				function(result){
					closingDate = result.getValue(sjResultSet.columns[0]);
					return false;
				}
			);
			console.log('closingDate', closingDate);
			console.log('parseInt(closingDate)', + parseInt(closingDate));
			console.log('baseDate.getDate()', + baseDate.getDate());
			
			//月末=31日
			if(closingDate != 31 && (parseInt(closingDate) >= parseInt(baseDate.getDate()))){
				baseDate.setDate(closingDate);
			}else if(closingDate != 31 && (parseInt(closingDate) < parseInt(baseDate.getDate()))){
				baseDate = new Date(moment(baseDate).add(1, 'M').format('YYYY/MM/DD'));
				baseDate.setDate(closingDate);
			}else if(closingDate == 31){
				console.log('Its an end of the month!');
				baseDate = new Date(moment(baseDate).endOf('month').format('YYYY/MM/DD'));
			}else{
				return;
			}
			console.log('baseDate: ' + baseDate);
			return baseDate;
		}catch(e){
			console.log('calculateClosingDate Error: ' + e);
			return null;
		}
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
	
	return {
		pageInit: pageInit,
		lineInit: lineInit,
		fieldChanged: fieldChanged,
		postSourcing: postSourcing,
		saveRecord: saveRecord
		//createCustomerReturn: createCustomerReturn
	};
});
