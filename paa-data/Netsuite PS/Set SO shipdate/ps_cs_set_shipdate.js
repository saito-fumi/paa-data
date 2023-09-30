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
		'N/search',
		'N/currentRecord'],
function(message, dialog, runtime, record, search, currentRecord){
	var globalCr = null;	//global変数としての currentRecord
	
	function pageInit(context){
		const currentRecord = context.currentRecord;	//currentRecordを取得
		globalCr = currentRecord;						//グローバル変数へ格納
		logW(globalCr);

		logW('context.mode', context.mode);
		if(context.mode === 'create' || context.mode === 'copy'){
			//標準機能でセットされる出荷日をクリア
			currentRecord.setValue({
				fieldId: 'shipdate',
				value: null,
				ignoreFieldChange: true,
				forceSyncSourcing: true
			});
		}
		//UI画面からの入力フラグをON
		currentRecord.setValue({
			fieldId: 'custbody_ns_ui_input',
			value: true,
			ignoreFieldChange: true,
			forceSyncSourcing: true
		});
		//
		if(context.mode === 'create'){
			const cf = currentRecord.getValue({fieldId: 'customform'});			//フォーム
			log.debug('cf', cf);
			if(cf == 128 || cf == 172 || cf == 176 || cf == 170 || cf==197 || cf==218 || cf==201){
				
				// //PAA - 注文書（サンプル出庫用_CSV用）
				// if(cf == 176){
				// 	currentRecord.setValue({
				// 		fieldId: 'entity',
				// 		value: 2874,
				// 		ignoreFieldChange: false,
				// 		forceSyncSourcing: true
				// 	});
				// 	currentRecord.setValue({
				// 		fieldId: 'location',
				// 		value: 287,
				// 		ignoreFieldChange: false,
				// 		forceSyncSourcing: true
				// 	});
				// 	currentRecord.setValue({
				// 		fieldId: 'custbody_ns_wms_trantype',
				// 		value: 125,
				// 		ignoreFieldChange: true,
				// 		forceSyncSourcing: true
				// 	});
				// }
				
				//ライン初期化
				currentRecord.cancelLine({
					sublistId: 'item'
				});
			}
		}
	}
	function postSourcing(context){
		var currentRecord = context.currentRecord;
		var sublistName = context.sublistId;
		var sublistFieldName = context.fieldId;
		var line = context.line;
		var item = null;
		if(sublistName === 'item' && sublistFieldName === 'item'){
			item = currentRecord.getCurrentSublistValue({
				sublistId: sublistName,
				fieldId: sublistFieldName
			});
			
			logW('item', item);
			
			const cf = currentRecord.getValue({fieldId: 'customform'});			//フォーム
			log.debug('cf', cf);
			if(cf == 128 || cf == 172 || cf == 176 || cf == 170 || cf==197 || cf==218 || cf==201){
				setSublistValue(currentRecord, 'item', 'price', -1);
				currentRecord.setCurrentSublistValue({
					sublistId: sublistName,
					fieldId: 'rate',
					value: 0
				});
			}
			try{
				const customer = currentRecord.getValue({fieldId: 'entity'});		//顧客
				
				logW('customer', customer);
				
				if(!isEmpty(customer)){
					const nonTax = search.lookupFields({
						type: search.Type.CUSTOMER,
						id: customer,
						columns: ['custentity_ns_non_tax']
					}).custentity_ns_non_tax;
					
					logW('nonTax', nonTax);
					if(nonTax){
						currentRecord.setCurrentSublistValue({
							sublistId: sublistName,
							fieldId: 'taxcode',
							value: 91
						});
					}
				}
			}catch(e){
				logW('e', e);
			}
			
		}
	}
	function fieldChanged(context){
		try{
			const fieldId = context.fieldId;				//変更されたフィールドのID
			//logW('fieldId', fieldId);
			
			if(fieldId === 'shipaddress' || fieldId === 'custbody_ns_delivery_date'){
				//配送先住所もしくはNS_納品日に変更があった場合
				
				var shipDate = null;							//変数：出荷日
				const currentRecord = context.currentRecord;	//currentRecordを取得
				
				shipDate = currentRecord.getValue({fieldId: 'shipDate'});	//出荷日を取得
				logW('shipDate', shipDate);
				
				if(!isEmpty(shipDate)){
					//出荷日が空ではない
					
					return;	//処理を抜ける
				}
				//出荷日が空の場合続行
				
				const shipaddress = currentRecord.getValue({fieldId: 'shipaddress'});						//配送先住所を取得
				logW('shipaddress', shipaddress);
				
				const deliveryDate = currentRecord.getValue({fieldId: 'custbody_ns_delivery_date'});		//NS_納品日を取得
				logW('deliveryDate', deliveryDate);
				if(isEmpty(deliveryDate)){
					//NS_納品日が空
					
					return;	//処理を抜ける
				}
				//NS_納品日が空でない場合続行
				const location = currentRecord.getValue({fieldId: 'location'});
				const subsidiary = currentRecord.getValue({fieldId: 'subsidiary'});
				
				//配送先住所からリードタイムを取得
				const leadTime = getLeadTime(shipaddress, subsidiary, location);
				logW('leadTime', leadTime);
				
				if(leadTime == 0){
					//リードタイムが取得できなかった場合
					
					return;	//処理を抜ける
				}
				
				//NS_納品日とリードタイムから出荷日を取得
				shipDate = getShipDate(deliveryDate, leadTime, subsidiary, location);
				logW('shipDate', shipDate);
				
				
				
				//出荷日をセット
				currentRecord.setValue({
					fieldId: 'shipdate',
					value: shipDate,
					ignoreFieldChange: true,
					forceSyncSourcing: true
				});
				
				//出荷日が取得できていた場合
				if(!isEmpty(shipDate)){
					//出荷日からNS_データ連携予定日を取得
					const dataLinkDate = getDataLinkDate(shipDate);
					logW('dataLinkDate', dataLinkDate);
					
					if(!isEmpty(dataLinkDate)){
						//NS_データ連携予定日をセット
						currentRecord.setValue({
							fieldId: 'custbody_ns_datalink_ex_date',
							value: dataLinkDate,
							ignoreFieldChange: true,
							forceSyncSourcing: true
						});
					}
				}
				
			}
		}catch(e){
			logW('e', e);
		}
	}
	function saveRecord(context){
		const currentRecord = context.currentRecord;	//currentRecordを取得
		var sampleFlg = false;
		var amount = 0;
		for(var i = 0; i < currentRecord.getLineCount({sublistId: 'item'}); i++){
			sampleFlg = currentRecord.getSublistValue({
				sublistId: 'item',
				fieldId: 'custcol_ns_sample',
				line: i
			});
			log.debug('sampleFlg', sampleFlg);
			if(sampleFlg){
				amount = currentRecord.getSublistValue({
					sublistId: 'item',
					fieldId: 'amount',
					line: i
				});
				log.debug('amount', amount);
				if(amount != 0){
					alert('サンプル品の場合、金額は0である必要があります。');
					return false;
				}
			}
		}
		
		var shipDate = currentRecord.getValue({fieldId: 'shipdate'});
		//log.debug('shipDate', shipDate);
		//log.debug('typeof shipDate', typeof shipDate);
		//log.debug('date2strYYYYMMDDNum(shipDate)', date2strYYYYMMDDNum(shipDate));
		
		if(isEmpty(shipDate)){
			//reCalc();
			
			const shipaddress = currentRecord.getValue({fieldId: 'shipaddress'});						//配送先住所を取得
			logW('shipaddress', shipaddress);
			
			const deliveryDate = currentRecord.getValue({fieldId: 'custbody_ns_delivery_date'});		//NS_納品日を取得
			logW('deliveryDate', deliveryDate);
			if(isEmpty(deliveryDate)){
				//NS_納品日が空
				
				//return;
			}else{
				//NS_納品日が空でない場合続行
				
				const location = currentRecord.getValue({fieldId: 'location'});
				const subsidiary = currentRecord.getValue({fieldId: 'subsidiary'});
				//配送先住所からリードタイムを取得
				const leadTime = getLeadTime(shipaddress, subsidiary, location);
				logW('leadTime', leadTime);
				
				if(leadTime == 0){
					//リードタイムが取得できなかった場合
					
					//return;
				}else{
					//リードタイムが取得できた場合
					
					//NS_納品日とリードタイムから出荷日を取得
					shipDate = getShipDate(deliveryDate, leadTime, subsidiary, location);
					logW('shipDate', shipDate);
					
					//出荷日をセット
					currentRecord.setValue({
						fieldId: 'shipdate',
						value: shipDate,
						ignoreFieldChange: true,
						forceSyncSourcing: true
					});
				}
			}
		}
		
		shipDate = currentRecord.getValue({fieldId: 'shipdate'});
		
		//出荷日が取得できていた場合
		if(!isEmpty(shipDate)){
			//出荷日からNS_データ連携予定日を取得
			const dataLinkDate = getDataLinkDate(shipDate);
			logW('dataLinkDate', dataLinkDate);
			
			if(!isEmpty(dataLinkDate)){
				//NS_データ連携予定日をセット
				currentRecord.setValue({
					fieldId: 'custbody_ns_datalink_ex_date',
					value: dataLinkDate,
					ignoreFieldChange: true,
					forceSyncSourcing: true
				});
			}
		}
		
		const cf = currentRecord.getValue({fieldId: 'customform'});			//フォーム
		log.debug('cf', cf);
		
		const role = runtime.getCurrentUser().role;
		log.debug('role', role);
		
		if(cf == 128 && role != 3){	//PAA - 注文書（サンプル出庫用）
			const dd = currentRecord.getValue({fieldId: 'custbody_ns_delivery_date'});		//NS_納品日
			const dl = currentRecord.getValue({fieldId: 'custbody_ns_datalink_ex_date'});		//データ連携予定日
			//log.debug('dd', dd);
			//log.debug('typeof dd', typeof dd);
			//log.debug('date2strYYYYMMDDNum(dd)', date2strYYYYMMDDNum(dd));
			
			const today = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());
			log.debug('today', today);
			log.debug('date2strYYYYMMDDNum(today)', date2strYYYYMMDDNum(today));
			
			var mes = '';
			
			if(!isEmpty(dd) && date2strYYYYMMDDNum(today) >= date2strYYYYMMDDNum(dd)){
				mes = 'NS_納品日が本日または本日以前です。\n納品日を変更して、"出荷日再計算"ボタンを押してください。';
				alert(mes);
				return false;
			}
			
			if(!isEmpty(shipDate) && date2strYYYYMMDDNum(today) >= date2strYYYYMMDDNum(shipDate)){
				mes = '出荷日が本日または本日以前です。\n納品日を変更して、"出荷日再計算"ボタンを押してください。';
				alert(mes);
				return false;
			}
            
			var nd = new Date();
			/*
			if(!isEmpty(shipDate) && date2strYYYYMMDDNumOver15(nd) >= date2strYYYYMMDDNum(shipDate)){
				mes = '連携時刻を過ぎています。出荷日を確認して下さい。\n納品日を変更して、"出荷日再計算"ボタンを押してください。';
				alert(mes);
				return false;
			}
			*/
			console.log('dl'+ dl);
			if(!isEmpty(dl)){
				console.log('date2strYYYYMMDDNumOver15(nd)'+ date2strYYYYMMDDNumOver15(nd));
				console.log('date2strYYYYMMDDNum(dl)'+ date2strYYYYMMDDNum(dl));
				if(!isEmpty(dl) && date2strYYYYMMDDNumOver15(nd) > date2strYYYYMMDDNum(dl)){
					mes = '本日の連携時刻を過ぎています。\n納品日を変更して、"出荷日再計算"ボタンを押してください。';
					alert(mes);
					return false;
				}
			}
			/*
			if(!isEmpty(mes)){
				//mes = mes + '保存してよろしいですか？';
				//return confirm(mes);
				alert(mes);
				return false;
			}
			*/
			return true;
		}else if(cf == 162){	//PAA - 注文書（リテール用）
			var priceLevel = null;
			for(i = 0; i < currentRecord.getLineCount({sublistId: 'item'}); i++){
				priceLevel = currentRecord.getSublistValue({
					sublistId: 'item',
					fieldId: 'price',
					line: i
				});
				log.debug('priceLevel', priceLevel);
				if(priceLevel == 1){
					//return confirm('顧客マスタに単価の登録がされていないアイテムがあります。');
					alert('顧客マスタに単価が登録されていません。営業特別承認者または営業管理者に登録してもらってください。');
					return false;
					break;
				}
			}
		}
		return true;
	}
	////////////////////
	//Add custom functions
	
	//再計算ボタンが押下された場合の処理
	function reCalc(){
		globalCr = currentRecord.get();
		//出荷日を空値に更新
		globalCr.setValue({
			fieldId: 'shipdate',
			value: null,
			ignoreFieldChange: true,
			forceSyncSourcing: true
		});
		
		//NS_出荷日を上書きすることで fieldChanged をトリガー
		globalCr.setValue({
			fieldId: 'custbody_ns_delivery_date',
			value: globalCr.getValue({fieldId: 'custbody_ns_delivery_date'}),
			ignoreFieldChange: false,
			forceSyncSourcing: true
		});
	}
	
	//空値判定
	function isEmpty(valueStr){
		return (valueStr === null || valueStr === '' || valueStr === undefined);
	}
	
	//配送先住所からリードタイムを算出
	function getLeadTime(shipaddress, subsidiary, location){
		//リードタイムが2日の都道府県配列
		var leadTime5list = [];
		var leadTime2list = [];
		var leadTime1list = [];
		
		if(subsidiary != 1){
			//PWS
			logW('リードタイム', 'PWS');
			leadTime5list = [
				'沖縄県'
			];
			
			leadTime2list = [
				'北海道',
				'青森県',
				'秋田県',
				'鳥取県',
				'島根県',
				'岡山県',
				'広島県',
				'山口県',
				'徳島県',
				'香川県',
				'愛媛県',
				'高知県',
				'福岡県',
				'佐賀県',
				'長崎県',
				'熊本県',
				'大分県',
				'宮崎県',
				'鹿児島県'
			];
			
			//リードタイムが1日の都道府県配列
			leadTime1list = [
				'岩手県',
				'宮城県',
				'山形県',
				'福島県',
				'茨城県',
				'栃木県',
				'群馬県',
				'埼玉県',
				'千葉県',
				'東京都',
				'神奈川県',
				'新潟県',
				'富山県',
				'石川県',
				'福井県',
				'山梨県',
				'長野県',
				'岐阜県',
				'静岡県',
				'愛知県',
				'三重県',
				'滋賀県',
				'京都府',
				'大阪府',
				'兵庫県',
				'奈良県',
				'和歌山県'
			];
		}else if(location == 872 || location == 1518 || location == 1520){
			//角川
			logW('リードタイム', '角川');
			leadTime2list = [
				'北海道',
				'鳥取県',
				'島根県',
				'岡山県',
				'広島県',
				'山口県',
				'徳島県',
				'香川県',
				'愛媛県',
				'高知県',
				'福岡県',
				'佐賀県',
				'長崎県',
				'熊本県',
				'大分県',
				'宮崎県',
				'鹿児島県',
				'沖縄県'
			];
			
			//リードタイムが1日の都道府県配列
			leadTime1list = [
				'青森県',
				'岩手県',
				'宮城県',
				'秋田県',
				'山形県',
				'福島県',
				'茨城県',
				'栃木県',
				'群馬県',
				'埼玉県',
				'千葉県',
				'東京都',
				'神奈川県',
				'新潟県',
				'富山県',
				'石川県',
				'福井県',
				'山梨県',
				'長野県',
				'岐阜県',
				'静岡県',
				'愛知県',
				'三重県',
				'滋賀県',
				'京都府',
				'大阪府',
				'兵庫県',
				'奈良県',
				'和歌山県'
			];
		}else{
			//通常
			logW('リードタイム', '通常');
			leadTime2list = [
				'北海道',
				'青森県',
				'秋田県',
				'鳥取県',
				'島根県',
				'岡山県',
				'広島県',
				'山口県',
				'徳島県',
				'香川県',
				'愛媛県',
				'高知県',
				'福岡県',
				'佐賀県',
				'長崎県',
				'熊本県',
				'大分県',
				'宮崎県',
				'鹿児島県',
				'沖縄県',
				'和歌山県'
			];
			
			//リードタイムが1日の都道府県配列
			leadTime1list = [
				'岩手県',
				'宮城県',
				'山形県',
				'福島県',
				'茨城県',
				'栃木県',
				'群馬県',
				'埼玉県',
				'千葉県',
				'東京都',
				'神奈川県',
				'新潟県',
				'富山県',
				'石川県',
				'福井県',
				'山梨県',
				'長野県',
				'岐阜県',
				'静岡県',
				'愛知県',
				'三重県',
				'滋賀県',
				'京都府',
				'大阪府',
				'兵庫県',
				'奈良県'
			];
		}
		
		var leadTime = 0;	//変数：リードタイム
		
		//リードタイムが5日の都道府県に該当するかチェック
		for(var i = 0; i < leadTime5list.length; i++){
			if(shipaddress.indexOf(leadTime5list[i]) > 0){
				logW(leadTime5list[i], 5);
				leadTime = 5;		//リードタイムに2を設定
				return leadTime;	//リードタイムを返却
			}
		}

		//リードタイムが2日の都道府県に該当するかチェック
		for(var i = 0; i < leadTime2list.length; i++){
			if(shipaddress.indexOf(leadTime2list[i]) > 0){
				logW(leadTime2list[i], 2);
				leadTime = 2;		//リードタイムに2を設定
				return leadTime;	//リードタイムを返却
			}
		}
		
		//リードタイムが1日の都道府県に該当するかチェック
		for(i = 0; i < leadTime1list.length; i++){
			if(shipaddress.indexOf(leadTime1list[i]) > 0){
				logW(leadTime1list[i], 1);
				leadTime = 1;		//リードタイムに1を設定
				return leadTime;	//リードタイムを返却
			}
		}
		
		//いずれのチェックにも該当しなかった場合（海外等）
		return leadTime;	//0としてリードタイムを返却
	}
	
	//NS_納品日とリードタイムから出荷日を算出
	function getShipDate(deliveryDate, leadTime, subsidiary, location){
		var shipDate = new Date(deliveryDate.getTime());		//配送日としてNS_納品日をデフォルトセット
		shipDate.setDate(shipDate.getDate() - leadTime);		//リードタイムを減算
		shipDate = getBusinessDay(shipDate, getHolidayList(subsidiary, location), subsidiary, location);	//直近の営業日を取得
		
		return shipDate;
	}
	
	//出荷日からNS_データ連携予定日	を算出
	function getDataLinkDate(shipDate){
		var dataLinkDate = new Date(shipDate.getTime());				//NS_データ連携予定日として出荷日をデフォルトセット
		dataLinkDate.setDate(dataLinkDate.getDate() - 1);				//1日前をセット
		dataLinkDate = getBusinessDay2(dataLinkDate, getHolidayList2());	//直近の営業日を取得
		
		return dataLinkDate;
	}
	
	//与えられた日付が営業日かチェックする
	function getBusinessDay(d, holidayList, subsidiary, location){
		const dow = d.getDay();		//曜日：Day of the week
		var hList = holidayList;	//祝日リスト
		
		if(isEmpty(hList)){
			//祝日リストを引数として渡されていない場合
			
			//祝日リストを取得
			hList = getHolidayList(subsidiary, location);
		}
		
		if(dow === 0 || dow === 6 || hList.includes(date2strYYYYMMDD(d)) || hList.includes(date2strYYYYMD(d))){
			//曜日が土日 もしくは 祝日
			
			var yesterday = new Date(d.getTime());		//日付をコピー
			yesterday.setDate(yesterday.getDate() - 1);	//1日前を取得
			logW('Call getBusinessDay', yesterday);
			return getBusinessDay(yesterday, hList);	//1日前を指定して再帰処理
		}else{
			logW('Return BusinessDay', d);
			return d;	//営業日を返却
		}
	}
	
	//祝日リストを取得する
	function getHolidayList(subsidiary, location){
		var holidaySearchResultSet = null;
		
		if(subsidiary != 1){
			logW('出荷日の祝日', 'PWS');
			//祝日リストの検索実行
			holidaySearchResultSet = search.create({
				type: 'customrecord_ns_shipdate_calc_holidays_y',	//祝日リスト
				columns: [{	//取得対象項目
					name: 'custrecord_ns_holiday_y',	//祝日
					sort: search.Sort.ASC								//昇順ソート
				}],
				filters: [										//ANDによる取得条件(フィルター)
					{	name: 'isinactive',							//無効でないもの
						operator: search.Operator.IS,
						values: ['F']
					}
				]
			})
			.run();
		}else if(location == 872 || location == 1518 || location == 1520){
			logW('出荷日の祝日', '角川');
			//祝日リストの検索実行
			holidaySearchResultSet = search.create({
				type: 'customrecord_ns_shipdate_calc_holidays_t',	//祝日リスト
				columns: [{	//取得対象項目
					name: 'custrecord_ns_holiday_t',	//祝日
					sort: search.Sort.ASC								//昇順ソート
				}],
				filters: [										//ANDによる取得条件(フィルター)
					{	name: 'isinactive',							//無効でないもの
						operator: search.Operator.IS,
						values: ['F']
					}
				]
			})
			.run();
		}else{
			logW('出荷日の祝日', '通常');
			//祝日リストの検索実行
			holidaySearchResultSet = search.create({
				type: 'customrecord_ns_shipdate_calc_holidays',	//祝日リスト
				columns: [{	//取得対象項目
					name: 'custrecord_ns_holiday',	//祝日
					sort: search.Sort.ASC								//昇順ソート
				}],
				filters: [										//ANDによる取得条件(フィルター)
					{	name: 'isinactive',							//無効でないもの
						operator: search.Operator.IS,
						values: ['F']
					}
				]
			})
			.run();
		}
		var holidayList = [];	//祝日リスト格納用配列
		
		//検索実行結果をループ
		holidaySearchResultSet.each(
			function(result){
				holidayList.push(result.getValue(holidaySearchResultSet.columns[0]));	//祝日を格納
				return true;
			}
		);
		
		logW('holidayList', holidayList);
		
		//祝日リストを返却
		return holidayList;
	}
	
	//与えられた日付が営業日かチェックする2
	function getBusinessDay2(d, holidayList){
		const dow = d.getDay();		//曜日：Day of the week
		var hList = holidayList;	//祝日リスト
		
		if(isEmpty(hList)){
			//祝日リストを引数として渡されていない場合
			
			//祝日リストを取得
			hList = getHolidayList2();
		}
		
		if(dow === 0 || dow === 6 || hList.includes(date2strYYYYMMDD(d)) || hList.includes(date2strYYYYMD(d))){
			//曜日が土日 もしくは 祝日
			
			var yesterday = new Date(d.getTime());		//日付をコピー
			yesterday.setDate(yesterday.getDate() - 1);	//1日前を取得
			logW('Call getBusinessDay2', yesterday);
			return getBusinessDay(yesterday, hList);	//1日前を指定して再帰処理
		}else{
			logW('Return BusinessDay2', d);
			return d;	//営業日を返却
		}
	}
	
	//祝日リストを取得する2
	function getHolidayList2(){
		//祝日リストの検索実行
		const holidaySearchResultSet = search.create({
			type: 'customrecord_suitel10n_jp_non_op_day',	//祝日リスト
			columns: [{	//取得対象項目
				name: 'custrecord_suitel10n_jp_non_op_day_date',	//祝日
				sort: search.Sort.ASC								//昇順ソート
			}],
			filters: [										//ANDによる取得条件(フィルター)
				{	name: 'isinactive',							//無効でないもの
					operator: search.Operator.IS,
					values: ['F']
				}
			]
		})
		.run();
		var holidayList = [];	//祝日リスト格納用配列
		
		//検索実行結果をループ
		holidaySearchResultSet.each(
			function(result){
				holidayList.push(result.getValue(holidaySearchResultSet.columns[0]));	//祝日を格納
				return true;
			}
		);
		
		logW('holidayList2', holidayList);
		
		//祝日リストを返却
		return holidayList;
	}
	
	function lineInit(context){
		const currentRecord = context.currentRecord;	//currentRecordを取得
		log.debug('context', context);
		try{
			const cf = currentRecord.getValue({fieldId: 'customform'});			//フォーム
			log.debug('cf', cf);
			if(cf == 128 || cf == 172 || cf == 176 || cf==197){
				setSublistValue(currentRecord, 'item', 'custcol_ns_sample', true);	//サンプル品
				//setSublistValue(currentRecord, 'item', 'pricelevel', -1);			//価格水準
				//setSublistValue(currentRecord, 'item', 'rate', 0);					//レート
			}

		}catch(e){
			log.error('e', e);
		}
	}

	//サブリストの値をセット
	function setSublistValue(cr, sublistId, fieldId, value){
		try{
			cr.setCurrentSublistValue({
				sublistId: sublistId,
				fieldId: fieldId,
				value: value
			});
		}catch(e){
			log.error('e', e + ': ' + fieldId);
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
		lineInit: lineInit,
		fieldChanged: fieldChanged,
		postSourcing: postSourcing,
		saveRecord: saveRecord,
		reCalc: reCalc
	};
});