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
				record.delete({
					type: params.type,
					id: params.id
				});
			}catch(e){
				log.error('params.type:, params.id, e', params.type +', ' + params.id + ', ' + e);
			}
		}

		return {
			each: each
		};
	}
);
