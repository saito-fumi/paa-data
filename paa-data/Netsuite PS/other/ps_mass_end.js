/**
* @NApiVersion 2.x
* @NScriptType MassUpdateScript
* @NModuleScope Public
*/
define(['N/record'],
	function(record) {
		/**
		 * Definition of Mass Update trigger point.
		 *
		 * @param {Object} params
		 * @param {string} params.type - Record type of the record being processed by the mass update
		 * @param {number} params.id - ID of the record being processed by the mass update
		 *
		 * @since 2016.1
		*/
		function each(params){
			try{
				
				const objRecord =  record.load({
					type: params.type,
					id: params.id/*,
					isDynamic: true,*/
				});
				
				for(i = 0; i < objRecord.getLineCount({sublistId: 'item'}); i++){
					objRecord.setSublistValue({
						sublistId: 'item',
						fieldId: 'isclosed',
						line: i,
						value: true
					});
				}
				
				objRecord.save({
					enableSourcing: true,
					ignoreMandatoryFields: true
				});
				/*
				record.submitFields({
					type: params.type,
					id: params.id,
					values: {
						orderstatus: 'H'
					},
					options: {
						enableSourcing: false,
						ignoreMandatoryFields : true
					}
				});
				*/
				/*
				record.delete({
					type: params.type,
					id: params.id
				});
				*/
			}catch(e){
				log.error('params.type:, params.id, e', params.type +', ' + params.id + ', ' + e);
			}
		}

		return {
			each: each
		};
	}
);
