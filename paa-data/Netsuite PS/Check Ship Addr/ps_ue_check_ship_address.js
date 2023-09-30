/**
 * Copyright (c) 1998-2017 NetSuite, Inc.
 * 2955 Campus Drive, Suite 100, San Mateo, CA, USA 94403-2511
 * All Rights Reserved.
 *
 * This software is the confidential and proprietary information of
 * NetSuite, Inc. ("Confidential Information"). You shall not
 * disclose such Confidential Information and shall use it only in
 * accordance with the terms of the license agreement you entered into
 * with NetSuite.
 *
 */

/**
 * @NApiVersion 2.x
 * @NScriptType UserEventScript
 * @NModuleScope SameAccount
 */

/**
 * Module Description
 *
 * Version    Date            Author           Remarks
 * 1.00       20 Jun 2021     Keito Imai       Initial version
 */
define(['N/log', 'N/error', 'N/record', 'N/search'],
function (log, error, record, search){
	function beforeLoad(context){
	}
	
	function beforeSubmit(context){
		try{
			const newRec = context.newRecord;	//新規レコードを取得
			const wmsCompFlg = newRec.getValue({
				fieldId: 'custbody_ns_wms_compflg'
			});
			if(wmsCompFlg){
				return;
			}
			log.debug('context', context);
			if(context.type == 'xedit'){
				return;
			}
			const overAddressMessage1 = '配送先の住所（都道府県から住所2まで）の文字数は合わせて200バイト（全角2バイト、半角1バイト）以内にしてください。';
			const overAddressMessage2 = '配送先の宛先（顧客名称）と 宛先（担当者）の文字数は合わせて79バイト（全角2バイト、半角1バイト）以内にしてください。';
			var customError = null;
			
			//配送先住所を取得
			const shipAddrSubRecord = newRec.getSubrecord({fieldId: 'shippingaddress'});
			log.debug('shipAddrSubRecord', shipAddrSubRecord);
			
			const country = shipAddrSubRecord.getValue({fieldId: 'country'});
			log.debug('country', country);
			
			const state = ''+shipAddrSubRecord.getValue({fieldId: 'state'});
			log.debug('state', state);
			const city = ''+shipAddrSubRecord.getValue({fieldId: 'city'});
			log.debug('city', city);
			const addr1 = ''+shipAddrSubRecord.getValue({fieldId: 'addr1'});
			log.debug('addr1', addr1);
			const addr2 = ''+shipAddrSubRecord.getValue({fieldId: 'addr2'});
			log.debug('addr2', addr2);
			const shipStr1 = state + city + addr1 + addr2;
			log.debug('shipStr1', shipStr1);
			const shipStr1Length = getStringLength(shipStr1, 'Shift_JIS');
			log.debug('shipStr1Length', shipStr1Length);
			
			if(shipStr1Length > 200){
				customError = error.create({
					name: 'TOO_LONG_SHIP_ADDRESS',
					message: overAddressMessage1,
					notifyOff: false
				});
				throw customError;
			}
			
			const addressee = '' + shipAddrSubRecord.getValue({fieldId: 'addressee'});
			log.debug('addressee', addressee);
			const attention = '' + shipAddrSubRecord.getValue({fieldId: 'attention'});
			log.debug('attention', attention);
			
			const shipStr2 = addressee + ' ' + attention;
			log.debug('shipStr2', shipStr2);
			const shipStr2Length = getStringLength(shipStr2, 'Shift_JIS');
			log.debug('shipStr2Length', shipStr2Length);
			if(shipStr2Length > 80){
				customError = error.create({
					name: 'TOO_LONG_SHIP_ADDRESSEE',
					message: overAddressMessage2,
					notifyOff: false
				});
				throw customError;
			}
			
			const zip = (''+shipAddrSubRecord.getValue({fieldId: 'zip'})).replace('-','');
			log.debug('zip', zip);
			
			if(country === 'JP' && !isEmpty(zip)){
				if(!checkZip(zip)){
					customError = error.create({
						name: 'WRONG_ZIP_CODE',
						message: '郵便番号が不正です。',
						notifyOff: false
					});
					throw customError;
				}
				if(!checkState(state, zip)){
					customError = error.create({
						name: 'WRONG_STATE',
						message: '都道府県が不正です。',
						notifyOff: false
					});
					throw customError;
				}
				
			}else{
				if(country === 'JP' && isEmpty(zip)){
					customError = error.create({
						name: 'WRONG_ZIP_CODE',
						message: '郵便番号が空値です。',
						notifyOff: false
					});
					throw customError;
				}
			}
			
		}catch(e){
			log.error('beforeSubmit: ', e);
			if(	e.name == 'TOO_LONG_SHIP_ADDRESS' ||
				e.name == 'TOO_LONG_SHIP_ADDRESSEE' ||
				e.name == 'WRONG_ZIP_CODE' ||
				e.name == 'WRONG_STATE'){
				throw e;
			}
		}
	}
	
	function afterSubmit(context){
	}
	//空値判定用関数 - 空値は true を返す
	function isEmpty(valueStr){
		return (valueStr === null || valueStr === '' || valueStr === undefined);
	}
	
	//郵便番号チェック
	function checkZip(zip){
		//NS_郵便番号マスタの検索実行
		const zipSearchResultSet = search.create({
			type: 'customrecord_paa_wms_zip',	//NS_郵便番号マスタ
			columns: [{	//取得対象項目
				name: 'internalid',	//内部ID
				sort: search.Sort.ASC								//昇順ソート
			}],
			filters: [										//ANDによる取得条件(フィルター)
				{	name: 'isinactive',							//無効でないもの
					operator: search.Operator.IS,
					values: ['F']
				},{	name: 'name',							//郵便番号
					operator: search.Operator.IS,
					values: [zip]
				}
			]
		})
		.run();
		
		var hitFlg = false;
		
		//検索実行結果をループ
		zipSearchResultSet.each(
			function(result){
				hitFlg = true;
				return false;	//1行見つかれば終了
			}
		);
		
		return hitFlg;
	}
	
	//都道府県チェック
	function checkState(state, zip){
		//NS_郵便番号マスタの検索実行
		const stateSearchResultSet = search.create({
			type: 'customrecord_paa_wms_zip',	//NS_郵便番号マスタ
			columns: [{	//取得対象項目
				name: 'internalid',	//内部ID
				sort: search.Sort.ASC								//昇順ソート
			}],
			filters: [										//ANDによる取得条件(フィルター)
				{	name: 'isinactive',							//無効でないもの
					operator: search.Operator.IS,
					values: ['F']
				},{	name: 'custrecord_paa_wms_zip_pref',		//都道府県
					operator: search.Operator.IS,
					values: [state]
				},{	name: 'name',							//郵便番号
					operator: search.Operator.IS,
					values: [zip]
				}
			]
		})
		.run();
		
		var hitFlg = false;
		
		//検索実行結果をループ
		stateSearchResultSet.each(
			function(result){
				hitFlg = true;
				return false;	//1行見つかれば終了
			}
		);
		
		return hitFlg;
	}
	
	//日付を yyyy/MM/dd 形式に変換して返却
	function date2strYYYYMMDD(d){
		return d.getFullYear() + '/' + (('00' + (d.getMonth() + 1)).slice(-2)) + '/' + ('00' + d.getDate()).slice(-2);
	}
	
	//日付を yyyy/MM/dd 形式に変換して返却
	function date2strYYYYMMDD2(d){
		return d.getFullYear() + (('00' + (d.getMonth() + 1)).slice(-2)) + ('00' + d.getDate()).slice(-2);
	}
	
	//日付を yyyy/M/d 形式に変換して返却
	function date2strYYYYMD(d){
		return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
	}
	
	//文字列長を取得
	function getStringLength(str, encode) {
		var count     = 0,
			setEncode = 'Shift_JIS',
			c         = '';
		
		if (encode && encode !== '') {
			if (encode.match(/^(SJIS|Shift[_\-]JIS)$/i)) {
				setEncode = 'Shift_JIS';
			} else if (encode.match(/^(UTF-?8)$/i)) {
				setEncode = 'UTF-8';
			}
		}
		
		for (var i = 0, len = str.length; i < len; i++) {
			c = str.charCodeAt(i);
			if (setEncode === 'UTF-8') {
				if ((c >= 0x0 && c < 0x81) || (c == 0xf8f0) || (c >= 0xff61 && c < 0xffa0) || (c >= 0xf8f1 && c < 0xf8f4)) {
					count += 1;
				} else {
					count += 2;
				}
			} else if (setEncode === 'Shift_JIS') {
				if ((c >= 0x0 && c < 0x81) || (c == 0xa0) || (c >= 0xa1 && c < 0xdf) || (c >= 0xfd && c < 0xff)) {
					count += 1;
				} else {
					count += 2;
				}
			}
		}
		return count;
	};
	return {
		beforeSubmit: beforeSubmit
		//afterSubmit: afterSubmit,
		//beforeLoad: beforeLoad
	};
});
