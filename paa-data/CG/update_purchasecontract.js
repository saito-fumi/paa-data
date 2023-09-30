/**
 *@NApiVersion 2.x
 *@NScriptType ScheduledScript
 */

 define(['N/search', 'N/record', 'N/runtime', 'N/format', 'N/file'],
 function (search, record, runtime, format, file) {

	 function main() {

		 try{
			var fileObj = file.load({
				id: 'SuiteScripts/CG/update_purchasecontract.csv'
				// id: 4301
			});
			var contents ;
			if (fileObj.size < 10485760){
				contents = fileObj.getContents();
			}
			var parsedData = contents.split(/\n/g);
			for (var i = 0; i < parsedData.length; i++) {
				parsedData[i] = parsedData[i].split(",");
			}
			//l('length==>>' + parsedData.length);

			if(parsedData.length<2){
				l('lenth < 2, no data!');
				return;
			}

			var oldId = '';
			for (var i = 1; i < parsedData.length; i++) {
            	var purchasecontractId = parsedData[i][0];
				l('purchasecontractId=>>' + purchasecontractId);

                var searchResult = search.create({
                    type: search.Type.PURCHASE_CONTRACT,
                    columns: [{name: 'tranid'}],
                    filters: [{name:'externalId', operator: search.Operator.IS, values: purchasecontractId}]
                }).run().getRange({
                    start: 0,
                    end: 1
                });

				var purchasecontract;

              	if(searchResult != null && searchResult != ''){
                	purchasecontract = record.delete({
                  		type: record.Type.PURCHASE_CONTRACT,
                  		id: searchResult[0].id,
               		});
                	l('record.delete =>> success');
              	}

              	purchasecontract = record.create({type: record.Type.PURCHASE_CONTRACT, isDynamic: true});
                l('record.create =>> success');

				// システム管理ID
				purchasecontract.setValue({
					fieldId: 'externalid',
					value: purchasecontractId,
				});
				// 仕入先
				var entity = parsedData[i][1];
				var entityArray = entity.split(" ");
				l('entity=>>>>>' + entityArray[0]);
				var vendorSearchResult = generalSearch(search.Type.VENDOR, // recordType
					entity, // queryParam
					search.Operator.IS, // operator
					['entityid'], // resultset columns
					'entityid' // filter column
				);
				if(vendorSearchResult == 'undefined' || vendorSearchResult == ''){
					l('仕入先 error>>>>>');
					return;
				}
				l('仕入先entity=>>>>>' + vendorSearchResult[0].id);
				purchasecontract.setValue({
					fieldId: 'entity',
					value: vendorSearchResult[0].id,
				});
				// 子会社 「プレミアアンチエイジング株式会社」固定
				purchasecontract.setValue({
					fieldId: 'subsidiary',
					value: '1',
				});
				// 日付
				// var japanTime = new Date(getLocalizedJSTime());
				var trandate = parsedData[i][3];
				purchasecontract.setValue({
					fieldId: 'trandate',
					value: format.parse({
						value: trandate,
						type: format.Type.DATE
					}),
				});
				// 通貨 currencysymbol JPY
				// 為替レート 「1」固定
				purchasecontract.setValue({
					fieldId: 'exchangerate',
					value: 1,
				});
				// 次に基づく有効性
				purchasecontract.setValue({
					fieldId: 'effectivitybasedon',
					value: 'ORDERDATE',
				});
				// 契約開始日
				var startdate = parsedData[i][7];
				if(startdate == ''){
					l('契約開始日 error=>>>>>');
					break;
				}
				purchasecontract.setValue({
					fieldId: 'startdate',
					value: format.parse({
						value: startdate,
						type: format.Type.DATE
					}),
				});
				// 契約終了日
				var endDate = parsedData[i][8];
				if(endDate != ''){
					purchasecontract.setValue({
						fieldId: 'enddate',
						value: format.parse({
							value: endDate,
							type: format.Type.DATE
						}),
					});
				}
				// 最小金額
/*				var minAmount = 0;
 				if(parsedData[i][9] != ''){
                  minAmount = parsedData[i][9];
                }
                purchasecontract.setValue({
				  fieldId: 'minimumamount',
				  value: minAmount,
				});*/
				// 最大金額
				var maximumamount = 999999999999999;
				if(parsedData[i][10] != ''){
					maximumamount = parsedData[i][10];
				}
				purchasecontract.setValue({
					fieldId: 'maximumamount',
					value: maximumamount,
				});
				// 承認ステータス
                var approvalstatus = 0;
				l('承認ステータス=>>>>>' + parsedData[i][11]);
                if(parsedData[i][11] == '承認済み'){
                  approvalstatus = 2;
                }
                else if(parsedData[i][11] == '承認保留'){
                  approvalstatus = 1;
               }
				l('approvalstatus=>>>>>' + approvalstatus);
				purchasecontract.setValue({
					fieldId: 'approvalstatus',
					value: approvalstatus,
				});
				// メモ（ボディ）
				purchasecontract.setValue({
					fieldId: 'memo',
					value: parsedData[i][12],
				});
				// NS_最低発注数
				purchasecontract.setValue({
					fieldId: 'custbody_ns_minimum_cont_qty',
					value: parsedData[i][13],
				});
				// 部門
				var department = parsedData[i][14];
				//l('部門department=>>>>>' + department);
				var departmentSearchResult = generalSearch(search.Type.DEPARTMENT, // recordType
					department, // queryParam
					search.Operator.IS, // operator
					['name'], // resultset columns
					'name' // filter column
				);
				l('departmentSearchResult=>>>>>' + JSON.stringify(departmentSearchResult));
				purchasecontract.setValue({
					fieldId: 'department',
					value: departmentSearchResult[0].id,
				});
                // クラス
                var itemClass = parsedData[i][22];
                if(itemClass != null && itemClass != ''){
                  var itemClassSearchResult = generalSearch(search.Type.CLASSIFICATION, // recordType
                                                            itemClass, // queryParam
                                                            search.Operator.IS, // operator
                                                            ['name'], // resultset columns
                                                            'name' // filter column
                                                           );
                  l('itemClassSearchResult[0].id=>>>>>' + itemClassSearchResult[0].id);
                  purchasecontract.setValue({
                      fieldId: 'class',
                      value: itemClassSearchResult[0].id,
                  });
                }
				oldId = purchasecontractId;
				purchasecontract.selectNewLine({sublistId: 'item'});
                var itemNum = 0;
				var oldItemId = '';
				for (var j = i; j < parsedData.length; j++) {
					if(oldId != '' && oldId != parsedData[j][0]){
						i = j;
						break;
					}
					// アイテム別
					var itemName = parsedData[j][15];
					var itemNameArray = itemName.split(" ");
					l('itemName=>>>>>' + itemName);
					var itemNameSearchResult = generalSearch(search.Type.ITEM, // recordType
						itemNameArray[0], // queryParam
						search.Operator.IS, // operator
						['itemid'], // resultset columns
						'itemid' // filter column
					);
					if(itemNameSearchResult == ''){
						l('アイテム別 error=>>>>>');
						break;
					}
					l('itemNameSearchResult=>>>>>' + JSON.stringify(itemNameSearchResult[0]));
					// アイテム
					purchasecontract.setCurrentSublistValue(populateSublistField('item', 'item', itemNum, itemNameSearchResult[0].id));
                  	oldItemId = itemName;
					// 単位
					l('unit=>>>>>' + parsedData[j][16]);
					purchasecontract.setCurrentSublistValue(populateSublistField('item', 'unit', itemNum, parsedData[j][16]));
					// 説明
					l('description=>>>>>' + parsedData[j][17]);
					purchasecontract.setCurrentSublistValue(populateSublistField('item', 'description', itemNum, parsedData[j][17]));
					// 基本レート
					l('rate=>>>>>' + parsedData[j][18]);
					purchasecontract.setCurrentSublistValue(populateSublistField('item', 'rate', itemNum, parsedData[j][18]));
					// 税金コード
					var taxcode = parsedData[j][19];
					// l('taxcode=>>>>>' + taxcode);
					var taxcodeNameSearchResult = generalSearch(search.Type.SALES_TAX_ITEM, // recordType
						taxcode, // queryParam
						search.Operator.IS, // operator
						['itemid'], // resultset columns
						'itemid' // filter column
					);
					l('taxcode=>>>>>' + taxcodeNameSearchResult[0].id);
					purchasecontract.setCurrentSublistValue(populateSublistField('item', 'taxcode', itemNum, taxcodeNameSearchResult[0].id));
					// 部門
					var itemDepartment = parsedData[j][20];
					var itemDepartmentSearchResult = generalSearch(search.Type.DEPARTMENT, // recordType
						itemDepartment, // queryParam
						search.Operator.IS, // operator
						['name'], // resultset columns
						'name' // filter column
					);
					l('itemDepartmentSearchResult[0].id=>>>>>' + itemDepartmentSearchResult[0].id);
					 purchasecontract.setCurrentSublistValue(populateSublistField('item', 'department', itemNum, itemDepartmentSearchResult[0].id));
					// 場所
					var itemLocation = parsedData[j][21];
                    if(itemLocation != null && itemLocation != ''){
                      var itemLocationSearchResult = generalSearch(search.Type.LOCATION, // recordType
                          itemLocation, // queryParam
                          search.Operator.IS, // operator
                          ['name'], // resultset columns
                          'name' // filter column
                      );
                      l('itemLocationSearchResult[0].id=>>>>>' + itemLocationSearchResult[0].id);
				      purchasecontract.setCurrentSublistValue(populateSublistField('item', 'location', itemNum, itemLocationSearchResult[0].id));
                    }
					// クラス
					var itemClass = parsedData[j][22];
                    if(itemClass != null && itemClass != ''){
                      var itemClassSearchResult = generalSearch(search.Type.CLASSIFICATION, // recordType
                          itemClass, // queryParam
                          search.Operator.IS, // operator
                          ['name'], // resultset columns
                          'name' // filter column
                      );
                      l('itemClassSearchResult[0].id=>>>>>' + itemClassSearchResult[0].id);
				      purchasecontract.setCurrentSublistValue(populateSublistField('item', 'class', itemNum, itemClassSearchResult[0].id));
                    }
                    // メモ（ライン）
                    purchasecontract.setCurrentSublistValue(populateSublistField('item', 'description', itemNum, parsedData[i][23]));
                  	// NS_契約期間FROM
                    var ns_fromdate = parsedData[i][24];
                    if(ns_fromdate != ''){
                      purchasecontract.setCurrentSublistValue(populateSublistField('item', 'custcol_pa_contract_from_date', itemNum,
                        format.parse({
                              value: ns_fromdate,
                              type: format.Type.DATE
                        })
                      ));
                    }
					// NS_契約期間TO
                    var ns_todate = parsedData[i][25];
                    if(ns_todate != ''){
                      purchasecontract.setCurrentSublistValue(populateSublistField('item', 'custcol_pa_contract_to_date', itemNum,
                        format.parse({
                              value: ns_todate,
                              type: format.Type.DATE
                        })
                      ));
                    }
					// NS_チャネル
					purchasecontract.setCurrentSublistValue(populateSublistField('item', 'custbody_ns_channel', itemNum, parsedData[i][26]));
					// NS_地域
					purchasecontract.setCurrentSublistValue(populateSublistField('item', 'custbody_ns_area', itemNum, parsedData[i][27]));

                	var discNum = 0;
                  	var k = 0;
					for (k = j; k < parsedData.length; k++) {
						if(oldId != parsedData[k][0]){
                            j = parsedData.length;
							break;
						}
						if(oldItemId != parsedData[k][15]){
							j = k - 1;
							break;
						}
						var subrec = purchasecontract.getCurrentSublistSubrecord({sublistId: 'item', fieldId: 'itempricing'});
						// 追加価格設定画面
						subrec.selectNewLine({sublistId: 'discount', line: discNum});
						// 数量ディスカウントの計算
						subrec.setCurrentSublistValue(populateSublistField('discount', 'calculatequantitydiscounts', discNum, parsedData[k][28]));
       					l('discount.calculatequantitydiscounts=>>>>>' + parsedData[k][28]);
						// 次を使用する価格
						subrec.setCurrentSublistValue(populateSublistField('discount', 'priceusing', discNum, parsedData[k][29]));
       					l('discount.priceusing=>>>>>' + parsedData[k][29]);
						// 次を使用して入力
						subrec.setCurrentSublistValue(populateSublistField('discount', 'inputusing', discNum, parsedData[k][30]));
       					l('discount.inputusing=>>>>>' + parsedData[k][30]);
						// 数量から
						subrec.setCurrentSublistValue(populateSublistField('discount', 'fromquantity', discNum, parsedData[k][31]));
       					l('discount.fromquantity=>>>>>' + parsedData[k][31]);
						// 単価またはロット価格
						subrec.setCurrentSublistValue(populateSublistField('discount', 'fromamount', discNum, parsedData[k][32]));
       					l('discount.fromamount=>>>>>' + parsedData[k][32]);
						// ディスカウント率
						subrec.setCurrentSublistValue(populateSublistField('discount', 'rate', discNum, parsedData[k][33]));
       					l('discount.rate=>>>>>' + parsedData[k][33]);
						// 注文済み量
						subrec.setCurrentSublistValue(populateSublistField('discount', 'amountordered', discNum, parsedData[k][34]));
       					l('discount.amountordered=>>>>>' + parsedData[k][34]);
						// メモ（追加価格設定）
                        var memo = parsedData[k][35].replace('\"', '');
                        try {
                          memo = memo + ',' + parsedData[k][36].replace('\"', '');
                        }
                        catch(e){}
						subrec.setCurrentSublistValue(populateSublistField('discount', 'memo', discNum, memo));
       					l('discount.memo=>>>>>' + parsedData[k][35]);

						subrec.commitLine({sublistId: 'discount' });
                  		l('commitLine.discount ===>>> i = ' + i + ', j = ' + j + ', k = ' + k + ', discNum = ' + discNum);
		              	discNum++;
					}
					purchasecontract.commitLine({sublistId: 'item' });
                  	l('commitLine.item ===>>> i = ' + i + ', j = ' + j + ', k = ' + k + ', itemNum = ' + itemNum);
              		itemNum++;
                  	i = k;
                    j = k - 1;
				}
				l(JSON.stringify(purchasecontract));
            	var savedId = purchasecontract.save();
				l('update_purchasecontract_record_success_ID===>>>'+savedId);
                i--;
			}
			l('update_purchasecontract_success>>>');
		 } catch (e) {
			 l('>> update_purchasecontract!!!! ' + e);
		 }

		function generalSearch(recordType, queryParam, operator, dataColumns, filterColumn) {

            if (queryParam == undefined || queryParam == '')
                return null;

            try {
                var searchRecord = search.create({
                    type: recordType,
                    columns: dataColumns,
                    filters: [filterColumn, operator, queryParam]
                }).run();

                return searchRecord.getRange({
                    start: 0,
                    end: 1
                });

            } catch (e) {
                log.debug(e.message);
                return null;
            }
        }

		 function getLocalizedJSTime(){

			var curr_date = new Date();
			var tokyoTime = format.format({
				   value : curr_date,
				   type: format.Type.DATETIME,
				   timezone: format.Timezone.ASIA_TOKYO
			   });
		   return tokyoTime;
		 }

		 function populateSublistField(sublistId, fieldId, line, fieldValue) {
            return {
                'sublistId': sublistId,
                'fieldId': fieldId,
                'line': line,
                'value': fieldValue
            }
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
