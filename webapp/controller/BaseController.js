/*global history */
sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/core/routing/History"
], function(Controller, History) {
	"use strict";

	return Controller.extend("TeamChat.controller.BaseController", {
		/**
		 * Convenience method for accessing the router in every controller of the application.
		 * @public
		 * @returns {sap.ui.core.routing.Router} the router for this component
		 */
		getRouter: function() {
			return this.getOwnerComponent().getRouter();
		},

		/**
		 * Convenience method for getting the view model by name in every controller of the application.
		 * @public
		 * @param {string} sName the model name
		 * @returns {sap.ui.model.Model} the model instance
		 */
		getModel: function(sName) {
			return this.getOwnerComponent().getModel(sName);
		},

		/**
		 * Convenience method for setting the view model in every controller of the application.
		 * @public
		 * @param {sap.ui.model.Model} oModel the model instance
		 * @param {string} sName the model name
		 * @returns {sap.ui.mvc.View} the view instance
		 */
		setModel: function(oModel, sName) {
			return this.getOwnerComponent().setModel(oModel, sName);
		},

		/**
		 * Convenience method for getting the resource bundle.
		 * @public
		 * @returns {sap.ui.model.resource.ResourceModel} the resourceModel of the component
		 */
		getResourceBundle: function() {
			return this.getOwnerComponent().getModel("i18n").getResourceBundle();
		},

		//format to get the YYYYMMDDHHMMSS format date to sort
		getNewDate: function(oDate) {
			// 26/01/2022T12:02
			var oDay = oDate.substr(0, 2);
			var oMonth = oDate.substr(3, 2);
			var oYear = oDate.substr(6, 4);
			var oHour = oDate.substr(11, 2);
			var oMin = oDate.substr(14, 2);
			var oSencond = oDate.substr(17, 2) ? oDate.substr(17, 2) : '00';
			var oNewDate = oYear + oMonth + oDay + oHour + oMin + oSencond;

			var oNewDate2 = new Date(oYear, oMonth, oDay, oHour, oMin, oSencond);

			return oNewDate;
		},

		formantDate: function(oDate) {
			var oYear = oDate.substr(0, 4);
			var oMonth = oDate.substr(4, 2);
			var oDay = oDate.substr(8, 2);
			var oHour = oDate.substr(10, 2);
			var oMin = oDate.substr(12, 2);
			var oSencond = oDate.substr(14, 2);

			var oNewDate = new Date(oYear, oMonth, oDay, oHour, oMin, oSencond);

			return oNewDate;
		},

		getFormatNewDate: function(oDate) {
			// 26/01/2022T12:02
			var oDay = oDate.substr(0, 2);
			var oMonth = oDate.substr(3, 2) - 1;
			var oYear = oDate.substr(6, 4);
			var oHour = oDate.substr(11, 2);
			var oMin = oDate.substr(14, 2);
			var oSencond = oDate.substr(17, 2) ? oDate.substr(17, 2) : '00';

			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				pattern: "yyyy-MM-dd HH:mm:ssZZ"
			});

			var oNewDate = new Date(oYear, oMonth, oDay, oHour, oMin, oSencond);

			return oNewDate;
		},

		// get 14 bit Hex Random ID in format like 26/01/2022T12:00
		getRanHex: function() {
			const genRanHex = size => [...Array(size)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
			return genRanHex(14);
		},

		// get current Date Time
		getCurrentDateTime: function() {
			var today = new Date();
			var dd = today.getDate();
			var mm = today.getMonth() + 1; //January is 0!
			var yyyy = today.getFullYear();
			if (dd < 10) {
				dd = '0' + dd;
			}
			if (mm < 10) {
				mm = '0' + mm;
			}

			var hour = today.getHours();
			var Minutes = today.getMinutes();
			var Seconds = today.getSeconds();

			if (hour < 10) {
				hour = '0' + hour
			}

			if (Minutes < 10) {
				Minutes = '0' + Minutes
			}

			if (Seconds < 10) {
				Seconds = '0' + Seconds
			}

			// 26/01/2022T12:00
			var today1 = (dd + '/' + mm + '/' + yyyy + 'T' + hour + ':' + Minutes + ':' + Seconds);
			return today1;
		},

		sortByLatestDate: function(oArray) {
			return oArray.sort((a, b) => (a.LatestDate < b.LatestDate) ? 1 : ((a.LatestDate > b.LatestDate) ? -1 : 0));
		},

		sortByNewDate: function(oArray) {
			return oArray.sort((a, b) => (a.newDate < b.newDate) ? 1 : ((a.newDate > b.newDate) ? -1 : 0));
		},

		getActiveInHowLong: function(oDate) {
			var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
				relative: true
			});
			if (!oDate) {
				return "";
			}
			var nMM = 1000 * 60; // milliseconds in a min
			var nMH = 1000 * 3600; // milliseconds in a hour
			var nMD = 1000 * 3600 * 24; // milliseconds in a day
			var nMMM = 1000 * 60 * 60 * 24 * 30; // milliseconds in a month
			var nMY = 1000 * 60 * 60 * 24 * 365; // milliseconds in a year
			var oNow = new Date();
			var oDate2 = oNow.getTime() - oDate.getTime();
			if (oDate2 / nMY > 1) {
				return "Active " + Math.floor(oDate2 / nMY) + "y ago";
			} else if (oDate2 / nMMM > 1) {
				return "Active " + Math.floor(oDate2 / nMMM) + "m ago";
			} else if (oDate2 / nMD > 1) {
				return "Active " + Math.floor(oDate2 / nMD) + "d ago";
			} else if (oDate2 / nMH > 1) {
				return "Active " + Math.floor(oDate2 / nMH) + "h ago";
			} else if (oDate2 / nMM > 1) {
				return "Active " + Math.floor(oDate2 / nMM) + "min ago";
			}
		}

	});

});