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
 * 1.00		2021/12/17				Keito Imai		Initial Version
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
	function pageInit(context){
	}
	function postSourcing(context){
	}
	function fieldChanged(context){
	}
	function saveRecord(context){
		return true;
	}
	function lineInit(context){
	}

	////////////////////
	//Add custom functions
	
	//代品返品の作成関数
	function createCustomerReturn(id){
		console.log('createCustomerReturn');
		console.log('id:' + id);
		
		//注文書をロード
		const soRecord = record.load({
			type: record.Type.SALES_ORDER,
			id: id,
			isDynamic: false
		});
		
		//作成済みの代品返品を取得
		const custbody_ns_created_daihin_henpin = soRecord.getText({fieldId: 'custbody_ns_created_daihin_henpin'});
		console.log('custbody_ns_created_daihin_henpin:' + custbody_ns_created_daihin_henpin);
		
		if(!isEmpty(custbody_ns_created_daihin_henpin)){
			//既に代品返品作成済みの場合
			
			alert('既に代品返品が作成済みです。\n' + custbody_ns_created_daihin_henpin);
			return;	//何もせず処理を抜ける
		}
	
		const location = 289;	//代品返品の場所：RE_C品
		
		//顧客
		const customer = soRecord.getValue({fieldId: 'entity'});
		console.log('customer:' + customer);
		
		//部門
		const department = soRecord.getValue({fieldId: 'department'});
		console.log('department:' + department);
		
		//NS_納品日
		const custbody_ns_delivery_date = soRecord.getValue({fieldId: 'custbody_ns_delivery_date'});
		console.log('custbody_ns_delivery_date:' + custbody_ns_delivery_date);
		
		if(!isEmpty(custbody_ns_delivery_date)){
			//NS_納品日が空じゃなければ
			
			var closingDate = calculateClosingDate(customer, custbody_ns_delivery_date);	//締日：NS_納品日から計算された顧客の締日
		}else{
			var closingDate = null;	//締日：NULL
		}
		
		//メモ
		const memo = soRecord.getValue({fieldId: 'memo'});
		console.log('memo:' + memo);
		
		//配送先
		const shipAddressList = soRecord.getValue({fieldId: 'shipaddresslist'});
		console.log('shipAddressList:' + shipAddressList);
		
		//配送先住所情報格納用オブジェクト
		const soShipAddressObj = {};
		
		//配送先サブレコード
		const soShipaddrSubrecord = soRecord.getSubrecord({fieldId: 'shippingaddress'});
		
		soShipAddressObj.country = soShipaddrSubrecord.getValue({fieldId: 'country'});				//配送先：国
		soShipAddressObj.zip = soShipaddrSubrecord.getValue({fieldId: 'zip'});						//配送先：郵便番号
		soShipAddressObj.state = soShipaddrSubrecord.getValue({fieldId: 'state'});					//配送先：都道府県
		soShipAddressObj.city = soShipaddrSubrecord.getValue({fieldId: 'city'});					//配送先：市区町村
		soShipAddressObj.addr1 = soShipaddrSubrecord.getValue({fieldId: 'addr1'});					//配送先：住所1
		soShipAddressObj.addr2 = soShipaddrSubrecord.getValue({fieldId: 'addr2'});					//配送先：住所2
		soShipAddressObj.addressee = soShipaddrSubrecord.getValue({fieldId: 'addressee'});			//配送先：宛先
		soShipAddressObj.attention = soShipaddrSubrecord.getValue({fieldId: 'attention'});			//配送先：宛先（担当者）
		soShipAddressObj.addrphone = soShipaddrSubrecord.getValue({fieldId: 'addrphone'});			//配送先：電話
		soShipAddressObj.addrphone = soShipAddressObj.addrphone.replace('+81', '0');				//配送先：電話を整形
		soShipAddressObj.custrecord_pa_print_dlvry_note = soShipaddrSubrecord.getValue({fieldId: 'custrecord_pa_print_dlvry_note'});	//配送先：PA_納品書を出力
		soShipAddressObj.custrecord_ne_wms_shipcode = soShipaddrSubrecord.getValue({fieldId: 'custrecord_ne_wms_shipcode'});			//配送先：NS_WMS_配送先コード
		soShipAddressObj.addrtext = soShipaddrSubrecord.getValue({fieldId: 'addrtext'});			//配送先：配送先住所
		soShipAddressObj.isresidential = soShipaddrSubrecord.getValue({fieldId: 'isresidential'});	//配送先：自宅住所
		soShipAddressObj.override = soShipaddrSubrecord.getValue({fieldId: 'override'});			//配送先：上書き可
						
		console.log('soShipAddressObj:' + JSON.stringify(soShipAddressObj));
		
		//注文書明細格納用配列
		var soItemArray = [];
		
		//注文書明細をループ
		for(var i = 0; i < soRecord.getLineCount({sublistId: 'item'}); i++){
			var tempItemObj = {};	//注文書明細一時Object
			
			//アイテムをセット
			tempItemObj.item = soRecord.getSublistValue({
				sublistId: 'item',
				fieldId: 'item',
				line: i
			});
			
			//数量をセット
			tempItemObj.quantity = soRecord.getSublistValue({
				sublistId: 'item',
				fieldId: 'quantity',
				line: i
			});
			
			//単価をセット
			tempItemObj.rate = 0;
			
			//クラスをセット
			tempItemObj.ns_class = soRecord.getSublistValue({
				sublistId: 'item',
				fieldId: 'class',
				line: i
			});
			
			//NS_チャネルをセット
			tempItemObj.custcol_ns_channel = soRecord.getSublistValue({
				sublistId: 'item',
				fieldId: 'custcol_ns_channel',
				line: i
			});
			
			//NS_地域をセット
			tempItemObj.custcol_ns_area = soRecord.getSublistValue({
				sublistId: 'item',
				fieldId: 'custcol_ns_area',
				line: i
			});
			
			log.debug('tempItemObj', tempItemObj);
			console.log('tempItemObj:' + JSON.stringify(tempItemObj));
			
			//配列へ一時Objectを格納
			soItemArray.push(tempItemObj);
		}
		
		console.log('soItemArray:' + JSON.stringify(soItemArray));
		
		//作成された代品返品トランザクションのID格納用変数
		var createdCustomerReturnRecordId = null;
		//エラーメッセージ格納用変数
		var errorMessage = null;
		try{
			//代品返品トランザクションを作成
			const customerReturnRecord = record.create({
				type: record.Type.RETURN_AUTHORIZATION,
				isDynamic: true
			});
			
			//代品返品トランザクションのヘッダー行セット
			customerReturnRecord.setValue({fieldId: 'customform', value: 142, ignoreFieldChange: false});					//カスタムフォーム：PREMIER ANTI-AGING - 返品（リテール用）
			customerReturnRecord.setValue({fieldId: 'entity', value: customer, ignoreFieldChange: false});					//顧客：注文書の顧客
			if(!isEmpty(closingDate)){
				//締日が空値でなければ
				
				customerReturnRecord.setValue({fieldId: 'custbody_suitel10n_inv_closing_date', value: closingDate, ignoreFieldChange: false});	//締日：注文書のNS_納品日から計算された顧客の締日
			}
			customerReturnRecord.setValue({fieldId: 'department', value: department, ignoreFieldChange: false});			//部門：注文書の顧客
			customerReturnRecord.setValue({fieldId: 'location', value: location, ignoreFieldChange: false});				//場所：RE_C品
			customerReturnRecord.setValue({fieldId: 'custbody_ns_created_from_so', value: id, ignoreFieldChange: false});	//NS_作成元注文書：注文書ID
			customerReturnRecord.setValue({fieldId: 'custbody_4392_includeids', value: false, ignoreFieldChange: false});	//締め請求書に含める：OFF
			customerReturnRecord.setValue({fieldId: 'memo', value: memo, ignoreFieldChange: false});						//メモ：注文書のメモ
			if(!isEmpty(shipAddressList)){
				customerReturnRecord.setValue({fieldId: 'shipaddresslist', value: shipAddressList, ignoreFieldChange: false});	//配送先の選択：注文書の配送先の選択
			}else{
				customerReturnRecord.setValue({fieldId: 'shipaddresslist', value: null, ignoreFieldChange: false});	//配送先の選択：NULL
				if(!isEmpty(soShipAddressObj.country) && !isEmpty(soShipAddressObj.state)){
					const shipaddrSubrecord = customerReturnRecord.getSubrecord({fieldId: 'shippingaddress'});
					if(!isEmpty(soShipAddressObj.country)){
						shipaddrSubrecord.setValue({fieldId: 'country',value: soShipAddressObj.country});
					}
					if(!isEmpty(soShipAddressObj.zip)){
						shipaddrSubrecord.setValue({fieldId: 'zip', value: soShipAddressObj.zip});
					}
					if(!isEmpty(soShipAddressObj.state)){
						shipaddrSubrecord.setValue({fieldId: 'state', value: soShipAddressObj.state});
					}
					if(!isEmpty(soShipAddressObj.city)){
						shipaddrSubrecord.setValue({fieldId: 'city', value: soShipAddressObj.city});
					}
					if(!isEmpty(soShipAddressObj.addr1)){
						shipaddrSubrecord.setValue({fieldId: 'addr1', value: soShipAddressObj.addr1});
					}
					if(!isEmpty(soShipAddressObj.addr2)){
						shipaddrSubrecord.setValue({fieldId: 'addr2', value: soShipAddressObj.addr2});
					}
					if(!isEmpty(soShipAddressObj.addressee)){
						shipaddrSubrecord.setValue({fieldId: 'addressee', value: soShipAddressObj.addressee});
					}
					if(!isEmpty(soShipAddressObj.attention)){
						shipaddrSubrecord.setValue({fieldId: 'attention', value: soShipAddressObj.attention});
					}
					if(!isEmpty(soShipAddressObj.addrphone)){
						shipaddrSubrecord.setValue({fieldId: 'addrphone', value: soShipAddressObj.addrphone});
					}
					if(!isEmpty(soShipAddressObj.addrtext)){
						shipaddrSubrecord.setValue({fieldId: 'addrtext', value: soShipAddressObj.addrtext});
					}
					if(!isEmpty(soShipAddressObj.isresidential)){
						shipaddrSubrecord.setValue({fieldId: 'isresidential', value: soShipAddressObj.isresidential});
					}
					if(!isEmpty(soShipAddressObj.custrecord_pa_print_dlvry_note)){
						shipaddrSubrecord.setValue({fieldId: 'custrecord_pa_print_dlvry_note', value: soShipAddressObj.custrecord_pa_print_dlvry_note});
					}
					if(!isEmpty(soShipAddressObj.custrecord_ne_wms_shipcode)){
						shipaddrSubrecord.setValue({fieldId: 'custrecord_ne_wms_shipcode', value: soShipAddressObj.custrecord_ne_wms_shipcode});
					}
					if(!isEmpty(soShipAddressObj.isresidential)){
						shipaddrSubrecord.setValue({fieldId: 'isresidential', value: soShipAddressObj.isresidential});
					}
				}
			}

			
			//代品返品トランザクションの明細行セット
			for(i = 0; i < soItemArray.length; i++){
				//注文書明細格納用配列をループ
				
				//新規行作成
				customerReturnRecord.selectNewLine({sublistId: 'item'});
				
				//明細の値をセット
				customerReturnRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'item', value: soItemArray[i].item, ignoreFieldChange: false});								//アイテム
				customerReturnRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'quantity', value: soItemArray[i].quantity, ignoreFieldChange: false});						//数量
				customerReturnRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'rate', value: soItemArray[i].rate, ignoreFieldChange: false});								//単価
				customerReturnRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'class', value: soItemArray[i].ns_class, ignoreFieldChange: false});	//クラス
				customerReturnRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_ns_channel', value: soItemArray[i].custcol_ns_channel, ignoreFieldChange: false});	//NS_チャネル
				customerReturnRecord.setCurrentSublistValue({sublistId: 'item', fieldId: 'custcol_ns_area', value: soItemArray[i].custcol_ns_area, ignoreFieldChange: false});			//NS_地域
				
				//明細をコミット
				customerReturnRecord.commitLine({sublistId: 'item'});
			}
			
			//代品返品トランザクションを保存
			createdCustomerReturnRecordId = customerReturnRecord.save({enableSourcing: true, ignoreMandatoryFields: true});
		}catch(e){
			//エラー時動作
			
			//エラーメッセージを変数にセット
			errorMessage = e;
		}
		
		if(createdCustomerReturnRecordId == null){
			//作成された代品返品トランザクションが null → エラー発生時
			alert('返品伝票の作成に失敗しました。\nエラー：\n' + errorMessage);
		}else{
			//作成された代品返品トランザクションが null ではない → 作成成功
			
			//注文書に代品返品トランザクションへのリンク作成
			record.submitFields({
				type: record.Type.SALES_ORDER,
				id: id,
				values: {
					custbody_ns_created_daihin_henpin: createdCustomerReturnRecordId
				},
				options: {
					enableSourcing: false,
					ignoreMandatoryFields : true
				}
			});
			console.log('createdCustomerReturnRecordId: ' + createdCustomerReturnRecordId);
			alert('返品伝票の作成に成功しました。\n作成した返品伝票へ画面遷移します。\n');
			
			//返品伝票のURL取得
			const RETURN_AUTHORIZATION_URL = url.resolveRecord({
				recordType: record.Type.RETURN_AUTHORIZATION,
				recordId: createdCustomerReturnRecordId,
				isEditMode: true
			});
			console.log('RETURN_AUTHORIZATION_URL: ' + RETURN_AUTHORIZATION_URL);
			
			//返品伝票へ移動
			window.location.replace(RETURN_AUTHORIZATION_URL);
		}
		
		
	}
	//空値判定関数
	function isEmpty(valueStr){
		return (valueStr === null || valueStr === '' || valueStr === undefined);
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
		//lineInit: lineInit,
		//fieldChanged: fieldChanged,
		//postSourcing: postSourcing,
		//saveRecord: saveRecord,
		createCustomerReturn: createCustomerReturn
	};
});
