/**	
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope Public
 */
 
/**
 * Module Description
 *
 * Version	Date					Author			Remarks
 * 1.00		2021/06/21				Keito Imai		Initial Version
 * 
 */

define(['N/task',
		'N/record',
		'N/redirect',
		'N/runtime',
		'N/error',
		'N/ui/serverWidget',
		'N/file',
		'N/search'],
function(task, record, redirect, runtime, error, ui, file, search){
	function onRequest(context){
		try{
			const request = context.request;
			const response = context.response;
			const params = request.parameters;
			const scriptObj = runtime.getCurrentScript();
			const jsonText = params.custpage_json_text;
			const dowMap = ['��', '��', '��', '��', '��', '��', '�y', '��'];
			var initform = null;
			
			log.debug('request', request);
			log.debug('response', response);
			log.debug('params', params);
			
			if (request.method === 'GET'){
				initform = ui.createForm({
					title: '�����A�b�v���[�h(���ݕ�)�F�t�@�C���I��'
				});
				initform.addField({
					id: 'custpage_ps_importfile',
					type: ui.FieldType.FILE,
					label: 'FILE'
				}).updateBreakType({
					breakType : ui.FieldBreakType.STARTROW
				});
				//initform.clientScriptModulePath = './ps_cs_upload_edi_so.js';
				initform.addSubmitButton({
					label: '���M'
				});
				response.writePage(initform);
			}else if(isEmpty(jsonText)){
				const importFile = request.files.custpage_ps_importfile;			//�Y�t���ꂽ�t�@�C�����擾
				importFile.encoding = file.Encoding.UTF_8;							//�����R�[�h���w��
				
				var importFileContents = importFile.getContents();					//�Y�t���ꂽ�t�@�C���̓��e���擾
				if(importFileContents.charCodeAt(0) === 0xFEFF){
					//BOM���폜����
					importFileContents = importFileContents.substr(1);
				}
				importFileContents = importFileContents.split('\r\n').join('\n');	//���s�R�[�h�𓝈�
				importFileContents = importFileContents.split('\r').join('\n');		//���s�R�[�h�𓝈�
				
				const importFileContentsArray = importFileContents.split('\n');		//�z��Ɋi�[
				log.audit('importFileContentsArray', importFileContentsArray);
				
				var errorFile = '';
				
				//�t�H�[���쐬
				initform = 	ui.createForm({
					title: '�����A�b�v���[�h(���ݕ�)�F�m�F'
				});
				
				initform.clientScriptModulePath = './ps_cs_upload_edi_so2.js';
				initform.addSubmitButton({
					label: '�o�^'
				});
				initform.addButton({
					id: 'custpage_ret',
					functionName: 'returnScreen()',
					label: '�߂�'
				});
				initform.addButton({
					id: 'custpage_download1',
					functionName: 'handleDownload()',
					label: '�G���[�t�@�C���̃_�E�����[�h'
				});
				initform.addField({
					id : 'custpage_message',
					type : ui.FieldType.LONGTEXT,
					label : '�@�@'
				}).updateDisplayType({
					displayType : ui.FieldDisplayType.INLINE
				});
				initform.addField({
					id : 'custpage_html',
					type : ui.FieldType.INLINEHTML,
					label : '�@�@'
				}).updateDisplayType({
					displayType : ui.FieldDisplayType.HIDDEN
				});
				initform.addField({
					id : 'custpage_json_text',
					type : ui.FieldType.LONGTEXT,
					label : 'json_text(Hidden)'
				}).updateDisplayType({
					displayType : ui.FieldDisplayType.HIDDEN
				});
				initform.addField({
					id : 'custpage_error_text',
					type : ui.FieldType.LONGTEXT,
					label : 'json_text(Hidden)'
				}).updateDisplayType({
					displayType : ui.FieldDisplayType.HIDDEN
				});
				initform.addField({
					id : 'custpage_screen_flg',
					type : ui.FieldType.CHECKBOX,
					label : 'screen_flg(Hidden)'
				}).updateDisplayType({
					displayType : ui.FieldDisplayType.HIDDEN
				}).defaultValue = 'T';
				
				//CSV�t�@�C���̍s����500�s�𒴂��Ă��܂��B500�s�ȉ��Ƀt�@�C���𕪊����Ă��������B
				if(importFileContentsArray.length > 500){
					initform.addField({
						id : 'custpage_error_message',
						type : ui.FieldType.TEXT,
						label : '�G���[���b�Z�[�W'
					}).updateDisplayType({
						displayType : ui.FieldDisplayType.INLINE
					}).defaultValue = 'CSV�t�@�C���̍s����500�s�𒴂��Ă��܂��B500�s�ȉ��Ƀt�@�C���𕪊����Ă��������B';
					response.writePage(initform);
					return;
				}
				
				var tempRowArray = null;
				var otherrefArray = [];
				for(var i = 0; i < importFileContentsArray.length; i++){
					tempRowArray = importFileContentsArray[i].split(',');
					if(tempRowArray.length < 3){
						break;
					}
					otherrefArray.push(tempRowArray[0]);
				}
				
				////////////////////////
				//Transaction Search
				var transactionSearchFilter = [
					['mainline', 'is', 'T'],
					'AND',
					['type', 'anyof', 'SalesOrd'],
					'AND',
				];
				var tempFilter = [];
				for(i = 0; i < otherrefArray.length; i++){
					tempFilter.push(['otherrefnum', 'equalto', otherrefArray[i]]);
					tempFilter.push('OR');
				}
				tempFilter.pop();
				log.debug('tempFilter', tempFilter);
				transactionSearchFilter.push(tempFilter);
				log.debug('transactionSearchFilter', transactionSearchFilter);
				
				const transactionSearch = search.create({
					type: 'salesorder',
					filters: transactionSearchFilter,
					columns: [
						search.createColumn({ name: 'otherrefnum', summary: search.Summary.GROUP}),
					],
				});
				log.debug('transactionSearch', transactionSearch);
				/*
				var transactionSearch = search.load({
					type: search.Type.TRANSACTION,			//�g�����U�N�V����
					id: 'customsearch_ns_tran_search_for_edi'
				}).run();
				*/
				
				const transactionSearchResultSet = transactionSearch.run();
				var transactionArray = [];	//�O��ID�i�[�p�z��
				
				const MAX_RESULTS = 1000;
				var arrReturnSearchResults = [];
				var intSearchIndex = 0;
				var arrResultSlice = null;
				
				
				
				do{
					arrResultSlice = transactionSearchResultSet.getRange(intSearchIndex, intSearchIndex + MAX_RESULTS);
					if(arrResultSlice == null){
						break;
					}

					arrReturnSearchResults = arrReturnSearchResults.concat(arrResultSlice);
					intSearchIndex = arrReturnSearchResults.length;
				}while(arrResultSlice.length >= MAX_RESULTS);
				
				for(i = 0; arrReturnSearchResults.length > i; i++){
					var externalId = arrReturnSearchResults[i].getValue(transactionSearchResultSet.columns[0]);
						
					if(isEmpty(externalId)){
						return true;
					}
					transactionArray.push(externalId);
				}
				
				/*
				//�������s���ʂ����[�v
				transactionSearchResultSet.each(
					function(result){
						var externalId = result.getValue(transactionSearchResultSet.columns[0]);
						
						if(isEmpty(externalId)){
							return true;
						}
						transactionArray.push(externalId);
						return true;
					}
				);
				*/
				log.debug('transactionArray', transactionArray);
				
				////////////////////////
				//Customer Search
				const customerSearchResultSet = search.load({
					type: search.Type.CUSTOMER,			//�ڋq
					id: 'customsearch_ns_customer_search_for_edi'
				})
				.run();
				var customerObj = {};	//�ڋq�i�[�p�z��
				var customerInternalIdArray = [];	//�ڋq����ID�i�[�p�z��
				arrReturnSearchResults = [];
				intSearchIndex = 0;
				arrResultSlice = null;
				
				do{
					arrResultSlice = customerSearchResultSet.getRange(intSearchIndex, intSearchIndex + MAX_RESULTS);
					if(arrResultSlice == null){
						break;
					}

					arrReturnSearchResults = arrReturnSearchResults.concat(arrResultSlice);
					intSearchIndex = arrReturnSearchResults.length;
				}while(arrResultSlice.length >= MAX_RESULTS);
				
				for(i = 0; arrReturnSearchResults.length > i; i++){
					var internalId = arrReturnSearchResults[i].getValue(customerSearchResultSet.columns[0]);
					var shipCode = arrReturnSearchResults[i].getValue(customerSearchResultSet.columns[1]);
					var customerId = arrReturnSearchResults[i].getValue(customerSearchResultSet.columns[2]);
					var customerName = arrReturnSearchResults[i].getValue(customerSearchResultSet.columns[3]);
					var addressLabel = arrReturnSearchResults[i].getValue(customerSearchResultSet.columns[4]);
					var addressId = arrReturnSearchResults[i].getValue(customerSearchResultSet.columns[5]);
					var zip = arrReturnSearchResults[i].getValue(customerSearchResultSet.columns[6]);
					var addressLabelFull = arrReturnSearchResults[i].getValue(customerSearchResultSet.columns[7]);
					var dowArr = arrReturnSearchResults[i].getValue(customerSearchResultSet.columns[8]).split(',');
					var ltt = arrReturnSearchResults[i].getValue(customerSearchResultSet.columns[9]);
					
					dowArr = dowArr.filter(
						function (value, index, array) {
							return array.indexOf(value) === index;
						}
					).sort();
					
					var dow = dowArr.join(',')
								.replace('1', '��')
								.replace('2', '��')
								.replace('3', '��')
								.replace('4', '��')
								.replace('5', '��')
								.replace('6', '�y')
								.replace('7', '��');
					
					if(isEmpty(shipCode)){
						continue;
					}
					
					if(isEmpty(customerObj[shipCode])){
						customerObj[shipCode] = {};
						customerObj[shipCode].shipCode = shipCode;
						customerObj[shipCode].internalId = internalId;
						customerObj[shipCode].customerId = customerId;
						customerObj[shipCode].customerName = customerName;
						customerObj[shipCode][addressLabel] = {};
						customerObj[shipCode][addressLabel].addressLabel = addressLabel;
						customerObj[shipCode][addressLabel].addressId = addressId;
						customerObj[shipCode][addressLabel].zip = zip;
						customerObj[shipCode][addressLabel].addressLabelFull = addressLabelFull;
						customerObj[shipCode][addressLabel].dow = dow;
						customerObj[shipCode][addressLabel].lt = ltt;
					}else{
						customerObj[shipCode][addressLabel] = {};
						customerObj[shipCode][addressLabel].addressLabel = addressLabel;
						customerObj[shipCode][addressLabel].addressId = addressId;
						customerObj[shipCode][addressLabel].zip = zip;
						customerObj[shipCode][addressLabel].addressLabelFull = addressLabelFull;
						customerObj[shipCode][addressLabel].dow = dow;
						customerObj[shipCode][addressLabel].lt = ltt;
					}
					customerInternalIdArray.push(internalId);
				}
				
				customerInternalIdArray = customerInternalIdArray.filter(
					function (value, index, array) {
						return array.indexOf(value) === index;
					}
				).sort();
				log.debug('customerInternalIdArray', customerInternalIdArray);
				
				/*
				//�������s���ʂ����[�v
				customerSearchResultSet.each(
					function(result){
						var internalId = result.getValue(customerSearchResultSet.columns[0]);
						var shipCode = result.getValue(customerSearchResultSet.columns[1]);
						var customerId = result.getValue(customerSearchResultSet.columns[2]);
						var customerName = result.getValue(customerSearchResultSet.columns[3]);
						var addressLabel = result.getValue(customerSearchResultSet.columns[4]);
						var addressId = result.getValue(customerSearchResultSet.columns[5]);
						var zip = result.getValue(customerSearchResultSet.columns[6]);
						
						if(isEmpty(shipCode)){
							return true;
						}
						
						if(isEmpty(customerObj[shipCode])){
							customerObj[shipCode] = {};
							customerObj[shipCode].shipCode = shipCode;
							customerObj[shipCode].internalId = internalId;
							customerObj[shipCode].customerId = customerId;
							customerObj[shipCode].customerName = customerName;
							customerObj[shipCode][addressLabel] = {};
							customerObj[shipCode][addressLabel].addressLabel = addressLabel;
							customerObj[shipCode][addressLabel].addressId = addressId;
							customerObj[shipCode][addressLabel].zip = zip;
						}else{
							customerObj[shipCode][addressLabel] = {};
							customerObj[shipCode][addressLabel].addressLabel = addressLabel;
							customerObj[shipCode][addressLabel].addressId = addressId;
							customerObj[shipCode][addressLabel].zip = zip;
						}
						
						return true;
					}
				);
				*/
				log.debug('customerObj', customerObj);
				
				
				////////////////////////
				//Customer Item Price Search
				const customerItemPriceSearch = search.load({
					type: search.Type.CUSTOMER,			//�ڋq
					id: 'customsearch_ns_customer_search_for_ed_2'
				});
				
				//�ڋq�t�B���^�[��ǉ�
				customerItemPriceSearch.filters.push(
					search.createFilter({
						name: 'internalid',
						operator: search.Operator.IS,
						values: customerInternalIdArray
					})
				);
				const customerItemPriceSearchResultSet = customerItemPriceSearch.run();
				
				var customerItemPriceObj = {};	//�ڋq�A�C�e�����i�i�[�p�z��
				arrReturnSearchResults = [];
				intSearchIndex = 0;
				arrResultSlice = null;
				
				do{
					arrResultSlice = customerItemPriceSearchResultSet.getRange(intSearchIndex, intSearchIndex + MAX_RESULTS);
					if(arrResultSlice == null){
						break;
					}

					arrReturnSearchResults = arrReturnSearchResults.concat(arrResultSlice);
					intSearchIndex = arrReturnSearchResults.length;
				}while(arrResultSlice.length >= MAX_RESULTS);
				
				for(i = 0; arrReturnSearchResults.length > i; i++){
					var internalId2 = arrReturnSearchResults[i].getValue(customerItemPriceSearchResultSet.columns[0]);
					var itemId = arrReturnSearchResults[i].getValue(customerItemPriceSearchResultSet.columns[1]);
					var itemPrice = arrReturnSearchResults[i].getValue(customerItemPriceSearchResultSet.columns[2]);
					
					if(isEmpty(itemPrice)){
						continue;
					}
					
					if(!isEmpty(internalId2) && !isEmpty(itemId) && !isEmpty(itemPrice)){
						customerItemPriceObj[internalId2+'_'+itemId] = itemPrice;
					}
				}
				
				log.debug('customerItemPriceObj', customerItemPriceObj);
				
				////////////////////////
				//Item Search
				const itemSearch = search.load({
					type: search.Type.ITEM,			//�A�C�e��
					id: 'customsearch_ns_item_search_for_edi'
				});
				log.debug('itemSearch', itemSearch);
				
				/*
				//�ڋq�t�B���^�[��ǉ�
				itemSearch.filters.push(
					search.createFilter({
						name: 'customer',
						join: 'pricing',
						operator: search.Operator.IS,
						values: customerInternalIdArray
					})
				);
				*/
				
				const itemSearchResultSet = itemSearch.run();
				
				var itemObj = {};	//�A�C�e���i�[�p�z��
				
				arrReturnSearchResults = [];
				intSearchIndex = 0;
				arrResultSlice = null;
				
				do{
					arrResultSlice = itemSearchResultSet.getRange(intSearchIndex, intSearchIndex + MAX_RESULTS);
					if(arrResultSlice == null){
						break;
					}

					arrReturnSearchResults = arrReturnSearchResults.concat(arrResultSlice);
					intSearchIndex = arrReturnSearchResults.length;
				}while(arrResultSlice.length >= MAX_RESULTS);
				var internalIdupcCodeMap = {};
				for(i = 0; arrReturnSearchResults.length > i; i++){
					var internalId3 = arrReturnSearchResults[i].getValue(itemSearchResultSet.columns[0]);
					var name = arrReturnSearchResults[i].getValue(itemSearchResultSet.columns[1]);
					var dispName = arrReturnSearchResults[i].getValue(itemSearchResultSet.columns[2]);
					//var nsName = arrReturnSearchResults[i].getValue(itemSearchResultSet.columns[3]);
					//var nsDispName = arrReturnSearchResults[i].getValue(itemSearchResultSet.columns[4]);
					var upcCode = arrReturnSearchResults[i].getValue(itemSearchResultSet.columns[3]);
					var irisu = arrReturnSearchResults[i].getValue(itemSearchResultSet.columns[4]);
					var basePrice = arrReturnSearchResults[i].getValue(itemSearchResultSet.columns[5]);
					/*
					var customer = arrReturnSearchResults[i].getValue(itemSearchResultSet.columns[5]);
					var maxQty = arrReturnSearchResults[i].getValue(itemSearchResultSet.columns[6]);
					var rate = arrReturnSearchResults[i].getValue(itemSearchResultSet.columns[7]);
					*/
					if(isEmpty(upcCode)){
						continue;
					}
					
					//internalIdupcCodeMap[internalId] = upcCode;
					
					if(isEmpty(itemObj[upcCode])){
						itemObj[upcCode] = {};
						itemObj[upcCode].upcCode = upcCode;
						itemObj[upcCode].internalId = internalId3;
						itemObj[upcCode].name = name;
						itemObj[upcCode].dispName = dispName;
						//itemObj[upcCode].nsName = nsName;
						//itemObj[upcCode].nsDispName = nsDispName;
						itemObj[upcCode].irisu = irisu;
						itemObj[upcCode].basePrice = basePrice;
						/*
						itemObj[upcCode][customer] = {};
						itemObj[upcCode][customer].maxList = [maxQty];
						itemObj[upcCode][customer].rateList = [rate];
						*/
					}/*else if(isEmpty(itemObj[upcCode][customer])){
						itemObj[upcCode][customer] = {};
						itemObj[upcCode][customer].maxList = [maxQty];
						itemObj[upcCode][customer].rateList = [rate];
					}else{
						itemObj[upcCode][customer].maxList.push(maxQty);
						itemObj[upcCode][customer].rateList.push(rate);
					}*/
				}
				/*
				//�������s���ʂ����[�v
				itemSearchResultSet.each(
					function(result){
						var internalId = result.getValue(itemSearchResultSet.columns[0]);
						var name = result.getValue(itemSearchResultSet.columns[1]);
						var dispName = result.getValue(itemSearchResultSet.columns[2]);
						//var nsName = result.getValue(itemSearchResultSet.columns[3]);
						//var nsDispName = result.getValue(itemSearchResultSet.columns[4]);
						var upcCode = result.getValue(itemSearchResultSet.columns[3]);
						var irisu = result.getValue(itemSearchResultSet.columns[4]);
						var customer = result.getValue(itemSearchResultSet.columns[5]);
						var maxQty = result.getValue(itemSearchResultSet.columns[6]);
						var rate = result.getValue(itemSearchResultSet.columns[7]);
						
						if(isEmpty(upcCode)){
							return true;
						}
						
						if(isEmpty(itemObj[upcCode])){
							itemObj[upcCode] = {};
							itemObj[upcCode].upcCode = upcCode;
							itemObj[upcCode].internalId = internalId;
							itemObj[upcCode].name = name;
							itemObj[upcCode].dispName = dispName;
							//itemObj[upcCode].nsName = nsName;
							//itemObj[upcCode].nsDispName = nsDispName;
							itemObj[upcCode].irisu = irisu;
							itemObj[upcCode][customer] = {};
							itemObj[upcCode][customer].maxList = [maxQty];
							itemObj[upcCode][customer].rateList = [rate];
						}else if(isEmpty(itemObj[upcCode][customer])){
							itemObj[upcCode][customer] = {};
							itemObj[upcCode][customer].maxList = [maxQty];
							itemObj[upcCode][customer].rateList = [rate];
						}else{
							itemObj[upcCode][customer].maxList.push(maxQty);
							itemObj[upcCode][customer].rateList.push(rate);
						}
						
						return true;
					}
				);
				*/
				log.debug('itemObj', itemObj);
				
				
				
				////////////////////////
				//SUBLIST
				var subList = initform.addSublist({
					id : 'custpage_edi_so_list',
					type : ui.SublistType.LIST,
					label : '�����A�b�v���[�h�F�m�F'
				});
				
				subList.addField({id : 'custpage_errorflg',				type : ui.FieldType.CHECKBOX,	label : '�G���[�t���O'})	.updateDisplayType({displayType : ui.FieldDisplayType.DISABLED});
				subList.addField({id : 'custpage_externalid',			type : ui.FieldType.TEXT,		label : '�����ԍ�'})		.updateDisplayType({displayType : ui.FieldDisplayType.DISABLED});
				subList.addField({id : 'custpage_csvdate',				type : ui.FieldType.DATE,		label : '���M������'})			.updateDisplayType({displayType : ui.FieldDisplayType.DISABLED});
				subList.addField({id : 'custpage_customer_cd',			type : ui.FieldType.TEXT,		label : '���M��'})			.updateDisplayType({displayType : ui.FieldDisplayType.DISABLED});
				subList.addField({id : 'custpage_customer_id',			type : ui.FieldType.TEXT,		label : '�ڋqID(��\��)'})	.updateDisplayType({displayType : ui.FieldDisplayType.HIDDEN});
				subList.addField({id : 'custpage_trandate',				type : ui.FieldType.DATE,		label : '������'})			.updateDisplayType({displayType : ui.FieldDisplayType.DISABLED});
				subList.addField({id : 'custpage_delivery_date',		type : ui.FieldType.TEXT,		label : '��]�[�i��'})			.updateDisplayType({displayType : ui.FieldDisplayType.DISABLED});
				subList.addField({id : 'custpage_shipaddress',			type : ui.FieldType.TEXT,		label : '���t��'})		.updateDisplayType({displayType : ui.FieldDisplayType.DISABLED});
				subList.addField({id : 'custpage_shipaddress_dow',		type : ui.FieldType.TEXT,		label : '���t��[�i�j��'})		.updateDisplayType({displayType : ui.FieldDisplayType.DISABLED});
				//subList.addField({id : 'custpage_shipday',				type : ui.FieldType.TEXT,		label : '�o�ד�'})		.updateDisplayType({displayType : ui.FieldDisplayType.DISABLED});
				subList.addField({id : 'custpage_shipaddress_id',		type : ui.FieldType.TEXT,		label : '���t��ID(��\��)'})		.updateDisplayType({displayType : ui.FieldDisplayType.HIDDEN});
				subList.addField({id : 'custpage_item',					type : ui.FieldType.TEXT,		label : '���i��'})		.updateDisplayType({displayType : ui.FieldDisplayType.DISABLED});
				subList.addField({id : 'custpage_item_id',				type : ui.FieldType.TEXT,		label : '�A�C�e��(��\��)'})		.updateDisplayType({displayType : ui.FieldDisplayType.HIDDEN});
				subList.addField({id : 'custpage_quantity',				type : ui.FieldType.TEXT,		label : '���ʁi�o�����Z�j'})		.updateDisplayType({displayType : ui.FieldDisplayType.DISABLED});
				subList.addField({id : 'custpage_rate_csv',				type : ui.FieldType.TEXT,		label : 'EDI�F�P���i�Ŕ��j'})		.updateDisplayType({displayType : ui.FieldDisplayType.DISABLED});
				subList.addField({id : 'custpage_amount_csv',			type : ui.FieldType.TEXT,		label : 'EDI�F���z�i�Ŕ��j'})		.updateDisplayType({displayType : ui.FieldDisplayType.DISABLED});
				subList.addField({id : 'custpage_rate',					type : ui.FieldType.TEXT,		label : '�P���i�Ŕ��j'})		.updateDisplayType({displayType : ui.FieldDisplayType.DISABLED});
				subList.addField({id : 'custpage_amount',				type : ui.FieldType.TEXT,		label : '���z�i�Ŕ��j'})		.updateDisplayType({displayType : ui.FieldDisplayType.DISABLED});
				subList.addField({id : 'custpage_memo1',				type : ui.FieldType.TEXT,		label : '���l1'})		.updateDisplayType({displayType : ui.FieldDisplayType.DISABLED});
				subList.addField({id : 'custpage_memo2',				type : ui.FieldType.TEXT,		label : '���l2'})		.updateDisplayType({displayType : ui.FieldDisplayType.DISABLED});
				
				var rowArray = null;
				var rowObj = null;
				var errorList = [];
				var count = 0;
				var errorCount = 0;
				var zoubinObj = {};	//���֊i�[�p�I�u�W�F�N�g
				var lt = 0;
				var dateCheckSkip = false;
				var shipDate = null;
				
				////////////////////////
				//�j���擾
				const holidayList = getHolidayList();
				
				log.debug('holidayList', holidayList);
				
				for(i = 0; i < importFileContentsArray.length; i++){
					dateCheckSkip = false;
					
					rowArray = importFileContentsArray[i].split(',');
					if(rowArray.length < 3){
						break;
					}
					count++;
					
					//log.audit('rowArray', rowArray);
					rowObj = {};
					rowObj.errorFlg = false;
					
					if(transactionArray.indexOf(rowArray[0]) >= 0){
						rowObj.externalid = rowArray[0] + '\n�o�^�ς݂̒����ԍ��ł��B';
						//subList.setSublistValue({id: 'custpage_errorflg', line : i, value : 'T'});
						//rowObj.errorFlg = true;
						//errorList.push(rowObj.externalid);
					}else{
						rowObj.externalid = rowArray[0];
					}
					rowObj.csvDate = new Date('20' + rowArray[1].substr(0, 2), (rowArray[1].substr(2, 2) - 1), rowArray[1].substr(4, 2));
					rowObj.csvDateStr = '20' + rowArray[1].substr(0, 2) + '/' + rowArray[1].substr(2, 2) + '/' + rowArray[1].substr(4, 2);
					rowObj.customerCSV = rowArray[2];
					rowObj.customer = !isEmpty(customerObj[rowObj.customerCSV]) ? rowObj.customerCSV + '\n' + customerObj[rowObj.customerCSV].customerId + ' ' + customerObj[rowObj.customerCSV].customerName :  rowObj.customerCSV + '\n�G���[�F���v����ڋq������܂���B';
					if(isEmpty(customerObj[rowObj.customerCSV])){
						subList.setSublistValue({id: 'custpage_errorflg', line : i, value : 'T'});
						rowObj.errorFlg = true;
						errorList.push(rowObj.externalid);
					}
					rowObj.trandate = new Date('20' + rowArray[3].substr(0, 2), (rowArray[3].substr(2, 2) - 1), rowArray[3].substr(4, 2));
					rowObj.trandateStr = '20' + rowArray[3].substr(0, 2) + '/' + rowArray[3].substr(2, 2) + '/' + rowArray[3].substr(4, 2);
					rowObj.deliveryDate = new Date('20' + rowArray[4].substr(0, 2), (rowArray[4].substr(2, 2) - 1), rowArray[4].substr(4, 2));
					rowObj.deliveryDow = dowMap[rowObj.deliveryDate.getDay()];
					rowObj.deliveryDateStr = '20' + rowArray[4].substr(0, 2) + '/' + rowArray[4].substr(2, 2) + '/' + rowArray[4].substr(4, 2);
					
					rowObj.shipAddressCSV = rowArray[5];
					
					
					
					if(		!isEmpty(customerObj[rowObj.customerCSV])												//�ڋq������
						&&	!isEmpty(customerObj[rowObj.customerCSV][rowObj.shipAddressCSV])						//�ڋq.�z����Z��������
						&&	!isEmpty(zoubinObj[customerObj[rowObj.customerCSV][rowObj.shipAddressCSV].addressId])	//����{�L�[(�ڋq.�z����Z��)������}
					){
						
					}else if(	!isEmpty(customerObj[rowObj.customerCSV])											//�ڋq������
						&&	!isEmpty(customerObj[rowObj.customerCSV][rowObj.shipAddressCSV])						//�ڋq.�z����Z��������
						&&	isEmpty(zoubinObj[customerObj[rowObj.customerCSV][rowObj.shipAddressCSV].addressId])	//����{�L�[(�ڋq.�z����Z��)���Ȃ�}
					){
						zoubinObj[customerObj[rowObj.customerCSV][rowObj.shipAddressCSV].addressId] = [];
						////////////////////////
						//NS_���ݕ�_���֔[�i�����X�g �擾
						//zoubin���X�g�̌������s
						var zobinSearchResultSet = search.create({
							type: 'customrecord_ns_daiichi_zoubin_deli_date',	//�z����
							columns: [{	//�擾�Ώۍ���
								name: 'custrecord_ns_daiichi_shipaddress',	//�z����
								sort: search.Sort.ASC								//�����\�[�g
							},{
								name: 'custrecord_ns_daiichi_shipdate',	//���ւ̔[�i��
								sort: search.Sort.ASC								//�����\�[�g
							}],
							filters: [										//AND�ɂ��擾����(�t�B���^�[)
								{	name: 'isinactive',							//�����łȂ�����
									operator: search.Operator.IS,
									values: ['F']
								},
								{	name: 'custrecord_ns_daiichi_shipaddress',	//�z����
									operator: search.Operator.IS,
									values: [customerObj[rowObj.customerCSV][rowObj.shipAddressCSV].addressId]
								},
								
							]
						})
						.run();
						
						
						arrReturnSearchResults = [];
						intSearchIndex = 0;
						arrResultSlice = null;
						
						do{
							arrResultSlice = zobinSearchResultSet.getRange(intSearchIndex, intSearchIndex + MAX_RESULTS);
							if(arrResultSlice == null){
								break;
							}

							arrReturnSearchResults = arrReturnSearchResults.concat(arrResultSlice);
							intSearchIndex = arrReturnSearchResults.length;
						}while(arrResultSlice.length >= MAX_RESULTS);
						
						for(var m = 0; arrReturnSearchResults.length > m; m++){
							var addId = arrReturnSearchResults[m].getValue(zobinSearchResultSet.columns[0]);
							var custrecord_ns_daiichi_shipdate = arrReturnSearchResults[m].getValue(zobinSearchResultSet.columns[1]);
							
							zoubinObj[addId].push(custrecord_ns_daiichi_shipdate);
						}
					}
					
					log.debug('zoubinObj', zoubinObj);
					log.debug('zoubinObj[customerObj[rowObj.customerCSV][rowObj.shipAddressCSV].addressId]', zoubinObj[customerObj[rowObj.customerCSV][rowObj.shipAddressCSV].addressId]);
					log.debug('rowObj.deliveryDate', rowObj.deliveryDate);
					log.debug('date2strYYYYMD(rowObj.deliveryDate)', date2strYYYYMD(rowObj.deliveryDate));
					log.debug('date2strYYYYMMDD(rowObj.deliveryDate)', date2strYYYYMMDD(rowObj.deliveryDate));
					
					if(	zoubinObj[customerObj[rowObj.customerCSV][rowObj.shipAddressCSV].addressId].indexOf(date2strYYYYMMDD(rowObj.deliveryDate)) >= 0 ||
						zoubinObj[customerObj[rowObj.customerCSV][rowObj.shipAddressCSV].addressId].indexOf(date2strYYYYMD(rowObj.deliveryDate)) >= 0){
						dateCheckSkip = true;
					}
					
					log.debug('dateCheckSkip', dateCheckSkip);
					
					//���[�h�^�C���擾
					lt = 0;
					
					/*
					try{
						log.debug('customerObj[rowObj.customerCSV]', customerObj[rowObj.customerCSV]);
						log.debug('customerObj[rowObj.customerCSV][rowObj.shipAddressCSV]', customerObj[rowObj.customerCSV][rowObj.shipAddressCSV]);
						log.debug('customerObj[rowObj.customerCSV][rowObj.shipAddressCSV].lt', customerObj[rowObj.customerCSV][rowObj.shipAddressCSV].lt);
					}catch(e){
						log.debug('e', e);
					}
					*/
					
					rowObj.deliveryDateMes = '';
					
					if(!dateCheckSkip){
						if(!isEmpty(customerObj[rowObj.customerCSV]) && !isEmpty(customerObj[rowObj.customerCSV][rowObj.shipAddressCSV])){
							lt = customerObj[rowObj.customerCSV][rowObj.shipAddressCSV].lt * 1;
						}
						
						log.debug('lt', lt);
						
						//NS_�[�i���ƃ��[�h�^�C������o�ד����擾
						shipDate = getShipDate(rowObj.deliveryDate, lt);
						log.debug('shipDate', shipDate);
						
						log.debug('date2strYYYYMMDD(shipDate)', date2strYYYYMMDD(shipDate));
						
						if(holidayList.indexOf(date2strYYYYMMDD(shipDate)) >= 0 || holidayList.indexOf(date2strYYYYMD(shipDate)) >= 0){
							rowObj.deliveryDateMes += '\n�G���[�F�o�ד����j���ł��B';
							subList.setSublistValue({id: 'custpage_errorflg', line : i, value : 'T'});
							rowObj.errorFlg = true;
							errorList.push(rowObj.externalid);
						}else{
							log.debug('holidayList.indexOf(date2strYYYYMMDD(shipDate))', holidayList.indexOf(date2strYYYYMMDD(shipDate)));
							log.debug('holidayList.indexOf(date2strYYYYMD(shipDate))', holidayList.indexOf(date2strYYYYMD(shipDate)));
						}
					}else{
						rowObj.deliveryDateMes += '\n���[�i���͑��֑Ώۂł��B';
					}
					
					rowObj.shipAddress = !isEmpty(customerObj[rowObj.customerCSV]) && !isEmpty(customerObj[rowObj.customerCSV][rowObj.shipAddressCSV])
						?
							(''+customerObj[rowObj.customerCSV][rowObj.shipAddressCSV].zip).replace('-', '') == '' + rowArray[6].replace('-', '')
							? customerObj[rowObj.customerCSV][rowObj.shipAddressCSV].addressLabelFull
							: customerObj[rowObj.customerCSV][rowObj.shipAddressCSV].addressLabelFull + '�̏Z�����Ⴂ�܂��B�i�X�֔ԍ��s��v�j'
						:rowObj.shipAddressCSV + '\n�G���[�F���t��̓o�^������܂���B';
					if(	isEmpty(customerObj[rowObj.customerCSV]) ||
						isEmpty(customerObj[rowObj.customerCSV][rowObj.shipAddressCSV]) ||
						isEmpty(customerObj[rowObj.customerCSV][rowObj.shipAddressCSV].zip) ||
						customerObj[rowObj.customerCSV][rowObj.shipAddressCSV].zip.replace('-', '') != '' + rowArray[6].replace('-', '')
						){
						subList.setSublistValue({id: 'custpage_errorflg', line : i, value : 'T'});
						rowObj.errorFlg = true;
						errorList.push(rowObj.externalid);
					}
					rowObj.shipAddress_dow = !isEmpty(customerObj[rowObj.customerCSV]) && !isEmpty(customerObj[rowObj.customerCSV][rowObj.shipAddressCSV])
						?
							isEmpty(customerObj[rowObj.customerCSV][rowObj.shipAddressCSV].dow && !dateCheckSkip)
							? '�G���[�F�[�i�j�����ڋq�Z���ɓo�^����Ă��܂���B'
							: customerObj[rowObj.customerCSV][rowObj.shipAddressCSV].dow.indexOf(rowObj.deliveryDow) >= 0 || dateCheckSkip
								?customerObj[rowObj.customerCSV][rowObj.shipAddressCSV].dow
								:'�G���[�F�[�i�����[�i�j���Ɉ�v���܂���B\n' + customerObj[rowObj.customerCSV][rowObj.shipAddressCSV].dow
						:rowObj.shipAddressCSV + '�G���[�F���t��̓o�^������܂���B';
					if(	isEmpty(customerObj[rowObj.customerCSV]) ||
						isEmpty(customerObj[rowObj.customerCSV][rowObj.shipAddressCSV]) ||
							(
								isEmpty(customerObj[rowObj.customerCSV][rowObj.shipAddressCSV].dow) && !dateCheckSkip
							) ||
							(
								customerObj[rowObj.customerCSV][rowObj.shipAddressCSV].dow.indexOf(rowObj.deliveryDow) < 0 && !dateCheckSkip
							)
						){
						subList.setSublistValue({id: 'custpage_errorflg', line : i, value : 'T'});
						rowObj.errorFlg = true;
						errorList.push(rowObj.externalid);
					}
					if(	!isEmpty(customerObj[rowObj.customerCSV]) &&
						!isEmpty(customerObj[rowObj.customerCSV].internalId) &&
						!isEmpty(customerObj[rowObj.customerCSV][rowObj.shipAddressCSV]) &&
						!isEmpty(customerObj[rowObj.customerCSV][rowObj.shipAddressCSV].addressId)
						){
						rowObj.customerId = customerObj[rowObj.customerCSV].internalId;
						rowObj.addressId = customerObj[rowObj.customerCSV][rowObj.shipAddressCSV].addressId;
					}else{
						rowObj.customerId = 0;
						rowObj.addressId = 0;
					}
					rowObj.itemCSV = rowArray[7];
					rowObj.item = !isEmpty(itemObj[rowObj.itemCSV]) ? itemObj[rowObj.itemCSV].name + ' ' + itemObj[rowObj.itemCSV].dispName : '�G���[�FJAN�R�[�h���o�^����Ă��܂���B\n' + rowObj.itemCSV;
					if(isEmpty(itemObj[rowObj.itemCSV])){
						subList.setSublistValue({id: 'custpage_errorflg', line : i, value : 'T'});
						rowObj.errorFlg = true;
						errorList.push(rowObj.externalid);
						rowObj.itemId = 0;
					}else{
						rowObj.itemId = itemObj[rowObj.itemCSV].internalId;
					}
					rowObj.irisu = !isEmpty(itemObj[rowObj.itemCSV]) && !isEmpty(itemObj[rowObj.itemCSV].irisu) ? itemObj[rowObj.itemCSV].irisu : null;
					rowObj.qty1 = !isEmpty(rowArray[8]) ? rowArray[8] : 0;
					rowObj.qty2 = !isEmpty(rowArray[9]) ? rowArray[9] : 0;
					rowObj.qty3 = !isEmpty(rowObj.irisu) || rowObj.qty1 == 0 ? ''+Math.floor(((rowObj.qty1 - 0) * rowObj.irisu + (rowObj.qty2 - 0))) : '�G���[�F�A�C�e����NS_�������ݒ肳��Ă��܂���B';
					if(isEmpty(rowObj.irisu) && rowObj.qty1 != 0){
						subList.setSublistValue({id: 'custpage_errorflg', line : i, value : 'T'});
						rowObj.errorFlg = true;
						errorList.push(rowObj.externalid);
					}
					rowObj.qty4 = !isEmpty(rowObj.irisu) || isEmpty(rowObj.qty1) || rowObj.qty1 == 0 ? ''+Math.floor(((rowObj.qty1 - 0) * rowObj.irisu + (rowObj.qty2 - 0))) : 0;
					rowObj.rateCsv = rowArray[10];
					rowObj.amountCsv = rowObj.rateCsv * rowObj.qty4;
					
					/*
					if(rowObj.errorFlg == false){
						if(!isEmpty(itemObj[rowObj.itemCSV])){
							log.audit('itemObj[rowObj.itemCSV]', itemObj[rowObj.itemCSV]);
						}
						if(	!isEmpty(itemObj[rowObj.itemCSV]) &&
							!isEmpty(customerObj[rowObj.customerCSV])
						){
							log.audit('customerObj[rowObj.customerCSV]', customerObj[rowObj.customerCSV]);
						}
						if(	!isEmpty(itemObj[rowObj.itemCSV]) &&
							!isEmpty(customerObj[rowObj.customerCSV]) &&
							!isEmpty(customerObj[rowObj.customerCSV].internalId)
						){
							log.audit('customerObj[rowObj.customerCSV].internalId', customerObj[rowObj.customerCSV].internalId);
						}
						if(	!isEmpty(itemObj[rowObj.itemCSV]) &&
							!isEmpty(customerObj[rowObj.customerCSV]) &&
							!isEmpty(customerObj[rowObj.customerCSV].internalId) &&
							!isEmpty(itemObj[rowObj.itemCSV][''+customerObj[rowObj.customerCSV].internalId]) 
						){
							log.audit('itemObj[rowObj.itemCSV][''+customerObj[rowObj.customerCSV].internalId]", itemObj[rowObj.itemCSV][''+customerObj[rowObj.customerCSV].internalId]);
						}
						if(	!isEmpty(itemObj[rowObj.itemCSV]) &&
							!isEmpty(customerObj[rowObj.customerCSV]) &&
							!isEmpty(customerObj[rowObj.customerCSV].internalId) &&
							!isEmpty(itemObj[rowObj.itemCSV][''+customerObj[rowObj.customerCSV].internalId]) &&
							!isEmpty(itemObj[rowObj.itemCSV][''+customerObj[rowObj.customerCSV].internalId].maxList)
						){
							log.audit("itemObj[rowObj.itemCSV][''+customerObj[rowObj.customerCSV].internalId].maxList", itemObj[rowObj.itemCSV][''+customerObj[rowObj.customerCSV].internalId].maxList);
						}
					}
					*/
					
					if(	!isEmpty(rowObj.customerCSV) &&
						!isEmpty(customerObj[rowObj.customerCSV]) &&
						!isEmpty(customerObj[rowObj.customerCSV].internalId) &&
						!isEmpty(rowObj.itemCSV) &&
						!isEmpty(itemObj[rowObj.itemCSV]) &&
						!isEmpty(itemObj[rowObj.itemCSV].name) &&
						!isEmpty(customerItemPriceObj[customerObj[rowObj.customerCSV].internalId+'_'+itemObj[rowObj.itemCSV].name])
						){
						rowObj.rate = customerItemPriceObj[customerObj[rowObj.customerCSV].internalId+'_'+itemObj[rowObj.itemCSV].name];
						rowObj.amount = rowObj.rate * rowObj.qty4;
						/*
						for(var j = 0; itemObj[rowObj.itemCSV][customerObj[rowObj.customerCSV].internalId].maxList.length > j; j++){
							if(itemObj[rowObj.itemCSV][customerObj[rowObj.customerCSV].internalId].maxList[j] >= rowObj.qty4){
								rowObj.rate = itemObj[rowObj.itemCSV][customerObj[rowObj.customerCSV].internalId].rateList[j];
								break;
							}
						}
						*/
					/*}else if(	!isEmpty(rowObj.itemCSV) &&
								!isEmpty(itemObj[rowObj.itemCSV]) &&
								!isEmpty(itemObj[rowObj.itemCSV].basePrice)
						){
						log.debug('itemObj[rowObj.itemCSV]', itemObj[rowObj.itemCSV]);
						log.debug('itemObj[rowObj.itemCSV].basePrice', itemObj[rowObj.itemCSV].basePrice);
						rowObj.rate = itemObj[rowObj.itemCSV].basePrice;
					*/}else{
						//rowObj.rate = 0;
						rowObj.rate = -999;
						rowObj.amount = -999;
						subList.setSublistValue({id: 'custpage_errorflg', line : i, value : 'T'});
						rowObj.errorFlg = true;
						errorList.push(rowObj.externalid);
					}
					//rowObj.amount = rowObj.rate * rowObj.qty4;
					rowObj.memo1 = rowArray[12];
					rowObj.memo2 = rowArray[13];
					
					
					subList.setSublistValue({id: 'custpage_externalid', line : i, value : '' + rowObj.externalid});
					subList.setSublistValue({id: 'custpage_csvdate', line : i, value : rowObj.csvDateStr});
					subList.setSublistValue({id: 'custpage_customer_cd', line : i, value : rowObj.customer});
					subList.setSublistValue({id: 'custpage_customer_id', line : i, value : rowObj.customerId});
					subList.setSublistValue({id: 'custpage_shipaddress_id', line : i, value : rowObj.addressId});
					subList.setSublistValue({id: 'custpage_trandate', line : i, value : rowObj.trandateStr});
					subList.setSublistValue({id: 'custpage_delivery_date', line : i, value : rowObj.deliveryDateStr + '(' + rowObj.deliveryDow + ')' + rowObj.deliveryDateMes});
					subList.setSublistValue({id: 'custpage_shipaddress', line : i, value : rowObj.shipAddress});
					subList.setSublistValue({id: 'custpage_shipaddress_dow', line : i, value : rowObj.shipAddress_dow});
					subList.setSublistValue({id: 'custpage_item', line : i, value : rowObj.item});
					subList.setSublistValue({id: 'custpage_item_id', line : i, value : rowObj.itemId});
					subList.setSublistValue({id: 'custpage_quantity', line : i, value : rowObj.qty3});
					//
					//
					if(rowObj.rate == -999){
						subList.setSublistValue({id: 'custpage_rate_csv', line : i, value : '-'});
						subList.setSublistValue({id: 'custpage_amount_csv', line : i, value : '-'});
						subList.setSublistValue({id: 'custpage_rate', line : i, value : '�G���[�F�ڋq�ʃA�C�e���P�����ݒ肳��Ă��܂���B'});
						subList.setSublistValue({id: 'custpage_amount', line : i, value : '�G���[�F�ڋq�ʃA�C�e���P�����ݒ肳��Ă��܂���B'});
					}else{
						if(isEmpty(rowObj.rateCsv) || rowObj.rateCsv == 0){
							subList.setSublistValue({id: 'custpage_rate_csv', line : i, value : rowObj.rate});
							subList.setSublistValue({id: 'custpage_amount_csv', line : i, value : rowObj.amount});
						}else if(rowObj.rateCsv == rowObj.rate){
							subList.setSublistValue({id: 'custpage_rate_csv', line : i, value : rowObj.rateCsv});
							subList.setSublistValue({id: 'custpage_amount_csv', line : i, value : rowObj.amountCsv});
						}else{
							subList.setSublistValue({id: 'custpage_rate_csv', line : i, value : rowObj.rateCsv + '\n�P���}�X�^�ƒP�����قȂ�܂��B'});
							subList.setSublistValue({id: 'custpage_amount_csv', line : i, value : rowObj.amountCsv});
						}
						subList.setSublistValue({id: 'custpage_rate', line : i, value :rowObj.rate});
						subList.setSublistValue({id: 'custpage_amount', line : i, value : rowObj.amount});
					}
					
					if(!isEmpty(rowObj.memo1)){
						subList.setSublistValue({id: 'custpage_memo1', line : i, value : '' + rowObj.memo1});
					}
					if(!isEmpty(rowObj.memo2)){
						subList.setSublistValue({id: 'custpage_memo2', line : i, value : '' + rowObj.memo2});
					}
					
					
					/*
					if(!isEmpty(result.getText({name: idsBatchList.columns[4]}))){
						subList.setSublistValue({id: 'custpage_customer', line : i, value : result.getText({name: idsBatchList.columns[4]})});
					}
					subList.setSublistValue({id: 'custpage_created', line : i, value : ''+result.getValue({name: idsBatchList.columns[9]})});
					subList.setSublistValue({id: 'custpage_createdby', line : i, value : ''+result.getText({name: idsBatchList.columns[10]})});
					*/
					
					if(rowObj.errorFlg){
						errorCount++;
						errorFile += importFileContentsArray[i]+'\n';
					}
				}
				
				log.audit('errorList', errorList);
				log.audit('errorFile', errorFile);
				/*
				//�G���[�Ɠ���`�[���G���[�ɂ���
				for(i = 0; i < importFileContentsArray.length; i++){
					rowArray = importFileContentsArray[i].split(',');
					if(rowArray.length < 3){
						break;
					}
					log.audit('rowArray[0]', rowArray[0]);
					log.audit('typeof rowArray[0]', typeof rowArray[0]);
					if(errorList.indexOf(rowArray[0]) >= 0){
						log.audit('errorList match', rowArray[0]);
						subList.setSublistValue({id: 'custpage_errorflg', line : i, value : 'T'});
					}else{
						log.audit('errorList unmatch', rowArray[0] + ', ' + errorList.indexOf(rowArray[0]));
					}
				}
				*/
				
				
				log.debug('count: ', count);
				log.debug('ok: ', count - errorCount);
				log.debug('errorCount: ', errorCount);
				
				initform.updateDefaultValues({
					custpage_message : '�t�@�C���S���F' + count + '���@�@�o�^�\�����F' + (count - errorCount) + '���@�@�G���[�����F' + errorCount + '��'
				});
				initform.updateDefaultValues({
					custpage_error_text : errorFile
				});
				/*
				initform.setValue({
					id: 'custpage_message',
					value: '�t�@�C���S���F' + count + '���@�@�o�^�\�����F' + (count - errorCount) + '���@�@�G���[�����F' + errorCount + '��'
				});
				*/
				//�y�[�W�̕`��
				response.writePage(initform);
			}else{
				log.audit('jsonText', jsonText);
				const mapReduceTask = task.create({
					taskType: task.TaskType.MAP_REDUCE
				});
				mapReduceTask.scriptId = 'customscript_ps_mr_upload_edi_so2';
				//mapReduceTask.deploymentId = 'customdeploy1';
				mapReduceTask.params = {'custscript_ns_edi_so_info2': jsonText};
				
				const mrTaskId = mapReduceTask.submit();
				const taskStatus = task.checkStatus(mrTaskId);
				var	msg = '';
				
				if(taskStatus.status === 'FAILED'){
					log.debug('onRequest - rescheduleNextQueue', 'Failed to reschedule script');
					msg = 'task_create_failure';
				}else{
					log.debug('onRequest - rescheduleNextQueue', 'Successfully rescheduled script');
					msg = 'task_create_success';
				}
				
				redirect.toSuitelet({
					scriptId: runtime.getCurrentScript().getParameter({name: 'custscript_ps_sl_upload_edi_so_result_p2'}),
					deploymentId: 'customdeploy1',
					parameters: {
						'title' : '�����A�b�v���[�h(���ݕ�)�F�����J�n',
						'msg': '�����A�b�v���[�h�������J�n���܂����B����������A���[���ɂĒʒm����܂��B'
					}
				});
			}
		}catch(e) {
			log.error('onRequest: ERROR_ENCOUNTERED', e);
			var errorObj = error.create({
				name: 'onRequest: ERROR_ENCOUNTERED',
				message: e,
				notifyOff: false
			});
			throw errorObj;
		}
	}

	//Add custom functions
	function isEmpty(valueStr){
		return (valueStr === null || valueStr === "" || valueStr === undefined);
	}
	
	function splitByLength(str, length) {
		var resultArr = [];
		if (!str || !length || length < 1) {
			return resultArr;
		}
		var index = 0;
		var start = index;
		var end = start + length;
		while (start < str.length) {
			resultArr[index] = str.substring(start, end);
			index++;
			start = end;
			end = start + length;
		}
		return resultArr;
	}
	
	//�^����ꂽ���t���c�Ɠ����`�F�b�N����
	function getBusinessDay(d, holidayList){
		const dow = d.getDay();		//�j���FDay of the week
		var hList = holidayList;	//�j�����X�g
		
		if(isEmpty(hList)){
			//�j�����X�g�������Ƃ��ēn����Ă��Ȃ��ꍇ
			
			//�j�����X�g���擾
			hList = getHolidayList();
		}
		log.debug('hList1', hList);
		if(dow === 0 || dow === 6 || hList.indexOf(date2strYYYYMMDD(d)) >= 0 || hList.indexOf(date2strYYYYMD(d)) >= 0){
			//�j�����y�� �������� �j��
			
			var yesterday = new Date(d.getTime());		//���t���R�s�[
			yesterday.setDate(yesterday.getDate() - 1);	//1���O���擾
			log.debug('Call getBusinessDay', yesterday);
			return getBusinessDay(yesterday, hList);	//1���O���w�肵�čċA����
		}else{
			log.debug('Return BusinessDay', d);
			return d;	//�c�Ɠ���ԋp
		}
	}
	
	//�^����ꂽ���t���c�Ɠ����`�F�b�N����(�y���̂�)
	function getBusinessDayX(d){
		const dow = d.getDay();		//�j���FDay of the week
		
		if(dow === 0 || dow === 6){
			//�j�����y�� �������� �j��
			
			var yesterday = new Date(d.getTime());		//���t���R�s�[
			yesterday.setDate(yesterday.getDate() - 1);	//1���O���擾
			log.debug('Call getBusinessDayX', yesterday);
			return getBusinessDayX(yesterday);	//1���O���w�肵�čċA����
		}else{
			log.debug('Return BusinessDayX', d);
			return d;	//�c�Ɠ���ԋp
		}
	}
	
	//�^����ꂽ���t���c�Ɠ����`�F�b�N����2
	function getBusinessDay2(d, holidayList){
		const dow = d.getDay();		//�j���FDay of the week
		var hList = holidayList;	//�j�����X�g
		
		if(isEmpty(hList)){
			//�j�����X�g�������Ƃ��ēn����Ă��Ȃ��ꍇ
			
			//�j�����X�g���擾
			hList = getHolidayList();
		}
		log.debug('hList2', hList);
		if(dow === 0 || dow === 6 || hList.indexOf(date2strYYYYMMDD(d)) >= 0 || hList.indexOf(date2strYYYYMD(d)) >= 0){
			//�j�����y�� �������� �j��
			
			var yesterday = new Date(d.getTime());		//���t���R�s�[
			yesterday.setDate(yesterday.getDate() - 1);	//1���O���擾
			return getBusinessDay(yesterday, hList);	//1���O���w�肵�čċA����
		}else{
			return d;	//�c�Ɠ���ԋp
		}
	}
	
	//�j�����X�g���擾����
	function getHolidayList(){
		//�j�����X�g�̌������s
		const holidaySearchResultSet = search.create({
			type: 'customrecord_ns_shipdate_calc_holidays',	//�j�����X�g
			columns: [{	//�擾�Ώۍ���
				name: 'custrecord_ns_holiday',	//�j��
				sort: search.Sort.ASC								//�����\�[�g
			}],
			filters: [										//AND�ɂ��擾����(�t�B���^�[)
				{	name: 'isinactive',							//�����łȂ�����
					operator: search.Operator.IS,
					values: ['F']
				}
			]
		})
		.run();
		var holidayList = [];	//�j�����X�g�i�[�p�z��
		
		//�������s���ʂ����[�v
		holidaySearchResultSet.each(
			function(result){
				holidayList.push(result.getValue(holidaySearchResultSet.columns[0]));	//�j�����i�[
				return true;
			}
		);
		
		log.debug('holidayList', holidayList);
		
		//�j�����X�g��ԋp
		return holidayList;
	}
	
	//�j�����X�g���擾����2
	function getHolidayList2(){
		//�j�����X�g�̌������s
		const holidaySearchResultSet = search.create({
			type: 'customrecord_suitel10n_jp_non_op_day',	//�j�����X�g
			columns: [{	//�擾�Ώۍ���
				name: 'custrecord_suitel10n_jp_non_op_day_date',	//�j��
				sort: search.Sort.ASC								//�����\�[�g
			}],
			filters: [										//AND�ɂ��擾����(�t�B���^�[)
				{	name: 'isinactive',							//�����łȂ�����
					operator: search.Operator.IS,
					values: ['F']
				}
			]
		})
		.run();
		var holidayList = [];	//�j�����X�g�i�[�p�z��
		
		//�������s���ʂ����[�v
		holidaySearchResultSet.each(
			function(result){
				holidayList.push(result.getValue(holidaySearchResultSet.columns[0]));	//�j�����i�[
				return true;
			}
		);
		
		
		//�j�����X�g��ԋp
		return holidayList;
	}
	
	//���t�� yyyy/MM/dd �`���ɕϊ����ĕԋp
	function date2strYYYYMMDD(d){
		return d.getFullYear() + '/' + (('00' + (d.getMonth() + 1)).slice(-2)) + '/' + ('00' + d.getDate()).slice(-2);
	}
	
	//���t�� yyyy/MM/dd �`���ɕϊ����ĕԋp(�X���b�V���Ȃ�)
	function date2strYYYYMMDD_noSlash(d){
		return d.getFullYear() + '' + (('00' + (d.getMonth() + 1)).slice(-2)) + '' + ('00' + d.getDate()).slice(-2);
	}
	
	//���t�� yyyy/MM/dd �`���ɕϊ����ĕԋp
	function date2strYYYYMMDD2(d){
		return d.getFullYear() + (('00' + (d.getMonth() + 1)).slice(-2)) + ('00' + d.getDate()).slice(-2);
	}
	
	//���t�� yyyy/M/d �`���ɕϊ����ĕԋp
	function date2strYYYYMD(d){
		return d.getFullYear() + '/' + (d.getMonth() + 1) + '/' + d.getDate();
	}
	
	//NS_�[�i���ƃ��[�h�^�C������o�ד����Z�o
	function getShipDate(deliveryDate, leadTime){
		var shipDate = new Date(deliveryDate.getTime());		//�z�����Ƃ���NS_�[�i�����f�t�H���g�Z�b�g
		shipDate.setDate(shipDate.getDate() - leadTime);		//���[�h�^�C�������Z
		shipDate = getBusinessDayX(shipDate);					//���߂̉c�Ɠ����擾�i�y���̂ݔ���j
		
		return shipDate;
	}
	
	
	
	return {
		onRequest: onRequest
	};
});
