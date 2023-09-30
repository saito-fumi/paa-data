/**
 *@NApiVersion 2.x
 *@NScriptType ScheduledScript
 */

 define(['N/search', 'N/record', 'N/runtime', 'N/format', 'N/file'],
 function (search, record, runtime, format, file) {

	 function main() {

		 try{
			var fileObj = file.load({
				id: 'SuiteScripts/CG/update_po.csv'
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
            	var externalId = parsedData[i][0];
				l('externalId=>>' + externalId);
				// 前行と同じ外部IDかどうかチェックするために古い外部IDを保存
				oldId = externalId;

                var searchResult = search.create({
                    type: search.Type.PURCHASE_ORDER,
                    columns: [{name: 'tranid'}],
                    filters: [{name:'externalId', operator: search.Operator.IS, values: externalId}]
                }).run().getRange({
                    start: 0,
                    end: 1
                });

				var purchaseorder;

              	if(searchResult != null && searchResult != ''){
                	purchaseorder = record.delete({
                  		type: record.Type.PURCHASE_ORDER,
                  		id: searchResult[0].id,
               		});
                	l('record.delete =>> success');
              	}

              	purchaseorder = record.create({type: record.Type.PURCHASE_ORDER, isDynamic: true});
                l('record.create =>> success');

				// カスタムフォーム
/*				purchaseorder.setValue({
					fieldId: 'customform',
					value: 153,
				});*/
				// 外部ID
				purchaseorder.setValue({
					fieldId: 'externalid',
					value: externalId,
				});
				// 発注書番号
				purchaseorder.setValue({
					fieldId: 'tranid',
					value: externalId,
				});
				// 仕入先
				var entity = parsedData[i][2];
				var entityArray = entity.split(" ");
				l('entity=>>>>>' + entityArray[1]);
				var vendorSearchResult = generalSearch(search.Type.VENDOR, // recordType
					entityArray[1], // queryParam
					search.Operator.IS, // operator
					['entityid'], // resultset columns
					'entityid' // filter column
				);
				if(vendorSearchResult == 'undefined' || vendorSearchResult == ''){
					l('仕入先 error>>>>>');
					return;
				}
				l('仕入先entity=>>>>>' + vendorSearchResult[0].id);
				purchaseorder.setValue({
					fieldId: 'entity',
					value: vendorSearchResult[0].id,
				});
				// 日付
				var trandate = parsedData[i][3];
				purchaseorder.setValue({
					fieldId: 'trandate',
					value: format.parse({
						value: trandate,
						type: format.Type.DATE
					}),
				});
				// NS_発注稟議NO
				var ringi = parsedData[i][4];
				var ringiSearchResult = generalSearch('customrecord_ns_ringi_num', // recordType
					ringi, // queryParam
					search.Operator.IS, // operator
					['custrecord167'], // resultset columns
					'custrecord167' // filter column
				);
				if(ringiSearchResult == 'undefined' || ringiSearchResult == ''){
					l('NS_発注稟議NO error>>>>>');
					return;
				}
				l('NS_発注稟議NO=>>>>>' + ringiSearchResult[0].id);
				purchaseorder.setValue({
					fieldId: 'custbody_ns_ringi_num',
					value: ringiSearchResult[0].id,
				});
              	// 承認ステータス
				purchaseorder.setValue({
					fieldId: 'approvalstatus',
					value: 2,
				});
				// 子会社 「プレミアアンチエイジング株式会社」固定
				purchaseorder.setValue({
					fieldId: 'subsidiary',
					value: '1',
				});
				// 部門
				var department = parsedData[i][7];
				//l('部門department=>>>>>' + department);
				var departmentSearchResult = generalSearch(search.Type.DEPARTMENT, // recordType
					department, // queryParam
					search.Operator.IS, // operator
					['name'], // resultset columns
					'name' // filter column
				);
				l('departmentSearchResult=>>>>>' + JSON.stringify(departmentSearchResult));
				purchaseorder.setValue({
					fieldId: 'department',
					value: departmentSearchResult[0].id,
				});
				// 為替レート 「1」固定
				purchaseorder.setValue({
					fieldId: 'exchangerate',
					value: parsedData[i][8],
				});
				// NS_備考
				purchaseorder.setValue({
					fieldId: 'custbody_ns_remark_text',
					value: parsedData[i][9],
				});
				// NS_帳票タイトル(発注書)
				purchaseorder.setValue({
					fieldId: 'custbody_ns_po_title_pdf',
					value: parsedData[i][10],
				});
				// 明細行を作成
				purchaseorder.selectNewLine({sublistId: 'item'});
                // 明細行数を初期化
                var itemNum = 0;
                // 明細行を処理
                var j;
				for (j = i; j < parsedData.length; j++) {
					// 前の行の外部IDと比較して違ったら明細行の処理を終了
					if(oldId != '' && oldId != parsedData[j][0]){
						i = j - 1;
						break;
					}
					// NS_アセンブリアイテム
					var assemblyItemName = parsedData[j][11];
					var assemblyItemNameArray = assemblyItemName.split(" ");
					l('ns_assemblyItemName=>>>>>' + assemblyItemName);
					l('assemblyItemName=>>>>>' + assemblyItemNameArray[0]);
					var assemblyItemNameSearchResult = generalSearch(search.Type.ASSEMBLY_ITEM, // recordType
						assemblyItemNameArray[0], // queryParam
						search.Operator.IS, // operator
						['itemid'], // resultset columns
						'itemid' // filter column
					);
					if(assemblyItemNameSearchResult == ''){
						l('NS_アセンブリアイテム error=>>>>>');
						break;
					}
					l('assemblyItemNameSearchResult=>>>>>' + JSON.stringify(assemblyItemNameSearchResult[0]));
					purchaseorder.setCurrentSublistValue(populateSublistField('item', 'custcol_ns_assembly', itemNum, assemblyItemNameSearchResult[0].id));
					// アセンブリ
					var assemblyItemNameSearchResult = generalSearch(search.Type.ASSEMBLY_ITEM, // recordType
						assemblyItemNameArray[0], // queryParam
						search.Operator.IS, // operator
						['itemid'], // resultset columns
						'itemid' // filter column
					);
					if(assemblyItemNameSearchResult == ''){
						l('アセンブリ error=>>>>>');
						break;
					}
					l('assemblyItemNameSearchResult=>>>>>' + JSON.stringify(assemblyItemNameSearchResult[0]));
					purchaseorder.setCurrentSublistValue(populateSublistField('item', 'assembly', itemNum, assemblyItemNameSearchResult[0].id));
					// 場所
					var itemLocation = parsedData[j][13];
                    if(itemLocation != null && itemLocation != ''){
                      var itemLocationSearchResult = generalSearch(search.Type.LOCATION, // recordType
                          itemLocation, // queryParam
                          search.Operator.IS, // operator
                          ['name'], // resultset columns
                          'name' // filter column
                      );
                      l('itemLocationSearchResult[0].id=>>>>>' + itemLocationSearchResult[0].id);
				      purchaseorder.setCurrentSublistValue(populateSublistField('item', 'location', itemNum, itemLocationSearchResult[0].id));
                    }
					// 部品表
					var bom = parsedData[j][14];
                    if(bom != null && bom != ''){
                      var bomSearchResult = generalSearch(search.Type.BOM, // recordType
                          bom, // queryParam
                          search.Operator.IS, // operator
                          ['name'], // resultset columns
                          'name' // filter column
                      );
                      l('bomSearchResult[0].id=>>>>>' + bomSearchResult[0].id);
				      purchaseorder.setCurrentSublistValue(populateSublistField('item', 'billofmaterials', itemNum, bomSearchResult[0].id));
                    }
					// 部品表の修正
					var bomRevision = parsedData[j][15];
                    if(bomRevision != null && bomRevision != ''){
                      var bomRevisionSearchResult = generalSearch(search.Type.BOM_REVISION, // recordType
                          bomRevision, // queryParam
                          search.Operator.IS, // operator
                          ['name'], // resultset columns
                          'name' // filter column
                      );
                      l('bomRevisionSearchResult[0].id=>>>>>' + bomRevisionSearchResult[0].id);
				      purchaseorder.setCurrentSublistValue(populateSublistField('item', 'billofmaterialsrevision', itemNum, bomRevisionSearchResult[0].id));
                    }
					// アイテム
					var itemName = parsedData[j][16];
					var itemNameArray = itemName.split(" ");
					l('itemName=>>>>>' + itemName);
					var itemNameSearchResult = generalSearch(search.Type.OTHER_CHARGE_ITEM, // recordType
						itemNameArray[0], // queryParam
						search.Operator.IS, // operator
						['itemid'], // resultset columns
						'itemid' // filter column
					);
					if(itemNameSearchResult == ''){
						l('アイテム error=>>>>>');
						break;
					}
					l('itemNameSearchResult=>>>>>' + JSON.stringify(itemNameSearchResult[0]));
					purchaseorder.setCurrentSublistValue(populateSublistField('item', 'item', itemNum, itemNameSearchResult[0].id));
					// 数量
					l('quantity=>>>>>' + parsedData[j][17]);
					purchaseorder.setCurrentSublistValue(populateSublistField('item', 'quantity', itemNum, parsedData[j][17]));
					// 単価/率
					purchaseorder.setCurrentSublistValue(populateSublistField('item', 'rate', itemNum, parsedData[j][18]));
					l('cost=>>>>>' + parsedData[j][18]);
 					// 税金コード
/*					var taxcode = parsedData[j][19];
					var taxcodeSearchResult = generalSearch(search.Type.SALES_TAX_ITEM, // recordType
						taxcode, // queryParam
						search.Operator.IS, // operator
						['itemid'], // resultset columns
						'itemid' // filter column
					);
					purchaseorder.setCurrentSublistValue(populateSublistField('item', 'taxcode', itemNum, taxcodeSearchResult[0].id));
					l('taxcode=>>>>>' + taxcodeSearchResult[0]);
*/
					purchaseorder.setCurrentSublistValue(populateSublistField('item', 'taxcode', itemNum, 5));
					l('taxcode=>>>>>' + 5);
   					// クラス
					var className = parsedData[j][20];
					var classNameSearchResult = generalSearch(search.Type.CLASSIFICATION, // recordType
						className, // queryParam
						search.Operator.IS, // operator
						['name'], // resultset columns
						'name' // filter column
					);
					l('className=>>>>>' + classNameSearchResult[0].id);
					purchaseorder.setCurrentSublistValue(populateSublistField('item', 'class', itemNum,  classNameSearchResult[0].id));
   					// NS_チャネル
					var channel = parsedData[j][21];
					var channelSearchResult = generalSearch('customrecord_ns_channel', // recordType
						channel, // queryParam
						search.Operator.IS, // operator
						['name'], // resultset columns
						'name' // filter column
					);
					purchaseorder.setCurrentSublistValue(populateSublistField('item', 'custcol_ns_channel', itemNum, channelSearchResult[0].id));
					l('channel=>>>>>' + channelSearchResult[0].id);
					// NS_地域
					var area = parsedData[j][22];
					var areaSearchResult = generalSearch('customrecord_ns_area', // recordType
						area, // queryParam
						search.Operator.IS, // operator
						['name'], // resultset columns
						'name' // filter column
					);
//					purchaseorder.setCurrentSublistValue(populateSublistField('item', 'custcol_ns_area', itemNum, areaSearchResult[0].id));
//					l('area=>>>>>' + areaSearchResult[0].id);
					purchaseorder.setCurrentSublistValue(populateSublistField('item', 'custcol_ns_area', itemNum, 105));
					l('area=>>>>>' + 105);
					// NS_完成品の場所
					var itemCompletedLocation = parsedData[j][23];
                    if(itemCompletedLocation != null && itemCompletedLocation != ''){
                      var itemCompletedLocationSearchResult = generalSearch(search.Type.LOCATION, // recordType
                          itemCompletedLocation, // queryParam
                          search.Operator.IS, // operator
                          ['name'], // resultset columns
                          'name' // filter column
                      );
                      l('itemCompletedLocationSearchResult[0].id=>>>>>' + itemCompletedLocationSearchResult[0].id);
				      purchaseorder.setCurrentSublistValue(populateSublistField('item', 'custcol_ns_completed_location', itemNum, itemCompletedLocationSearchResult[0].id));
                    }
					// NS_確定状況判別ステータス
					var deliveryStatusConf = parsedData[j][24];
                    l('deliveryStatusConf=>>>>>' + deliveryStatusConf);
			        purchaseorder.setCurrentSublistValue(populateSublistField('item', 'custcol_ns_delivery_status_conf', itemNum, deliveryStatusConf));
					// NS_納品CSV出力済(仮)
					var arriveCsvFlg = parsedData[j][25];
                    l('arriveCsvFlg=>>>>>' + arriveCsvFlg);
			        purchaseorder.setCurrentSublistValue(populateSublistField('item', 'custcol_ns_arrive_csv_flg', itemNum, format.parse({
                            value: arriveCsvFlg,
                            type: format.Type.CHECKBOX
                        })));
                    // NS_希望納品日
                    var delidate = parsedData[j][5];
			        purchaseorder.setCurrentSublistValue(populateSublistField('item', 'custcol_ns_pref_deli_date', itemNum, format.parse({
                            value: delidate,
                            type: format.Type.DATE
                        })));
                    // 明細保存
					purchaseorder.commitLine({sublistId: 'item' });
                  	itemNum++;
				}
				l(JSON.stringify(purchaseorder));
            	var savedId = purchaseorder.save();
				l('update_purchaseorder_record_success_ID===>>>'+savedId);
                if(j >= parsedData.length){
					break;
                }
			}
			l('update_purchaseorder_success>>>');
		 } catch (e) {
			 l('>> update_purchaseorder!!!! ' + e);
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
