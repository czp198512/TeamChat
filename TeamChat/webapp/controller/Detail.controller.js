sap.ui.define([
	"TeamChat/controller/BaseController",
	// "sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Sorter",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/ui/model/FilterType",
	"sap/m/MessageToast"
], function(BaseController, JSONModel, Sorter, Filter, FilterOperator, FilterType, MessageToast, ChatsSet) {
	"use strict";
	var that;

	return BaseController.extend("TeamChat.controller.Detail", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf TeamChat.view.Detail
		 */

		onInit: function() {

			that = this;

			this._oTimeline = this.getView().byId("idTimeline");

			// jQuery.sap.delayedCall(1000, that, function() {

			// 	var oScroll = that._oTimeline._oScroller;
			// 	if (oScroll) {
			// 		// // var oItems = that._oTimeline.getItems();
			// 		// if (oItems.length > 1) {
			// 		// 	var oLastMessage = oItems[oItems.length - 1];
			// 		// 	that._oTimeline.getBindbingContext()
			// 		// 	oScroll.scrollToElement(0, oLastMessage, 800); //oLastMessage
			// 		// }
			// 		//oScroll.scrollTo(10);
			// 	}
			// });

			//var oRouter = this.getOwnerComponent().getRouter();
			//oRouter.getRoute("chat").attachPatternMatched(this._onObjectMatched, this);

			// time line set Custom Grouping
			this.byId("idTimeline").setCustomGrouping(function(oDate) {
				var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
					pattern: "MM/dd/yy, hh:mm a"
				});
				return {
					key: oDateFormat.format(oDate),
					title: oDateFormat.format(oDate),
					date: oDate
				};
			});

		},

		// _onObjectMatched: function(oEvent) {
		// 	// if (oEvent.getParameter("chatsSet")) {
		// 	// 	this.getView().bindElement({
		// 	// 		path: "/Chats(" + window.decodeURIComponent(oEvent.getParameter("arguments").phone) + ")"
		// 	// 	});
		// 	// }
		// },

		// Icon in timeline
		determineIcon: function(sent, delivered, read) {
			var sIcon;
			if (sent === "" && delivered === "" && read === "") {
				sIcon = "sap-icon://null";
			}
			if (sent === true && delivered === true && read === true) {
				sIcon = "sap-icon://message-success"; //blue
			}
			if (sent === true && delivered === true && read === false) {
				sIcon = "sap-icon://accept"; //gray
			}
			if (sent === true && delivered === false && read === false) {
				sIcon = "sap-icon://paper-plane"; // not Delivered
			}
			return sIcon;
		},
		// Status in timeline
		determineStatus: function(sent, delivered, read) {
			var sStatus;
			if (sent === "" && delivered === "" && read === "") {
				sStatus = "Success";
			}
			if (sent === true && delivered === true && read === true) {
				sStatus = "Success"; //blue
			}
			if (sent === true && delivered === true && read === false) {
				sStatus = "Information"; //gray
			}
			if (sent === true && delivered === false && read === false) {
				sStatus = "Information"; //
			}
			return sStatus;
		},

		// Alignment
		determineAlignment: function(phone) {
			return (phone === "649120015" ? "Left" : "Right");
		},

		// No Data text
		determinNoDataText: function(oName) {
			var oNoData = "You have not sent any message to " + oName;
			return oNoData;
		},

		//Enter event
		onSent: function(oEvent) {
			var oValue = oEvent.getSource().getValue();
			if (oValue === "") {
				MessageToast.show("Please input the content of the message.");
				return;
			}

			var oMyself = this.getOwnerComponent().getModel("myself").getData();
			var oChat = this.getOwnerComponent().getModel("chat").getData();
			var sId = that.getRanHex();
			var oNewChat = {
				phone: oChat.phone,
				contactName: oMyself.contactName,
				photo: oMyself.photo,
				id: sId,
				text: oValue,
				date: that.getCurrentDateTime(),
				newDate: that.getNewDate(that.getCurrentDateTime()),
				newFormatDate: new Date(),
				sent: true,
				delivered: false,
				read: false
			};

			// update models with new chat
			that.updateChatsSet(oNewChat);
			// clear the input
			this.byId("chatInput").setValue("");

		},
		// update models with new chat
		updateChatsSet: function(oNewChat) {
			var oChatsSetModel = this.getModel("Chats");
			var oChatsSetData = oChatsSetModel.getData();

			var chatIndex = oChatsSetData.findIndex(function(oChat) {
				return oChat.phone === oNewChat.phone;
			});
			var oSentMessage = oChatsSetData[chatIndex].SentMessages ? oChatsSetData[chatIndex].SentMessages : [];
			var oAllMessages = oChatsSetData[chatIndex].allMessages ? oChatsSetData[chatIndex].allMessages : [];
			//Update models
			oChatsSetData[chatIndex].LatestMessage = oNewChat.text;
			oChatsSetData[chatIndex].LatestDate = oNewChat.newDate;
			oSentMessage.push(oNewChat);
			oChatsSetData[chatIndex].SentMessages = that.sortByNewDate(oSentMessage);
			oAllMessages.push(oNewChat);
			oChatsSetData[chatIndex].allMessages = that.sortByNewDate(oAllMessages);

			oChatsSetData = this.sortByLatestDate(oChatsSetData);
			oChatsSetModel.setData(oChatsSetData);
			oChatsSetModel.refresh();

			var oAllMessagesModel = this.getModel("allMessages");
			oAllMessagesModel.refresh();
		}

	});

});