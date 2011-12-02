/**
 * @class Juniper.space.sm.form.InputRadio
 * @extends Ext.form.field.Radio
 *
 * An extension to Ext.form.field.Radio that shows a textfield next to the boxLabel of the radio
 * when included in a form the submitvalue of this field will be the value input in this textfield,
 * inputValue even if supplied in initCfg is ignored.
 *
 * @xtype inputradio
 *
 * @author Suman Yadav <sumanyadav1812@gmail.com>
 */
Ext.define('Ext.ux.form.field.InputRadio',{
  extend:'Ext.form.field.Radio',
  alias:'widget.inputradio',

    fieldSubTpl: [
        '<tpl if="boxLabel && boxLabelAlign == \'before\'">',
            '<label id="{cmpId}-boxLabelEl" class="{boxLabelCls} {boxLabelCls}-{boxLabelAlign}" for="{id}">{boxLabel}</label>',
        '</tpl>',
        // Creates not an actual checkbox, but a button which is given aria role="checkbox" and
        // styled with a custom checkbox image. This allows greater control and consistency in
        // styling, and using a button allows it to gain focus and handle keyboard nav properly.
        '<input type="button" id="{id}" ',
            '<tpl if="tabIdx">tabIndex="{tabIdx}" </tpl>',
            'class="{fieldCls} {typeCls}" autocomplete="off" hidefocus="true" />',
        '<tpl if="boxLabel && boxLabelAlign == \'after\'">',
            '<label id="{cmpId}-boxLabelEl" class="{boxLabelCls} {boxLabelCls}-{boxLabelAlign}" for="{id}" style="margin-right:4px;">{boxLabel}</label>',
        '</tpl>',
         '<input type="text" id="{id}-inputValueTextEl" style="width:50px;float:right;" class="x-inputradio-textVal x4-form-field x4-form-text" />',
        {
            disableFormats: true,
            compiled: true
        }
    ],

  renderSelectors:{
    inputValueTextEl:'input.x-inputradio-textVal'
  },

  getSubmitValue: function() {
    return this.checked ? (this.inputValueTextEl ? this.inputValueTextEl.getValue():null) : null;
  },


  renderActiveError: function() {
    var me = this,
        hasError = me.hasActiveError();
    if (me.inputValueTextEl) {
      // Add/remove invalid class
      me.inputValueTextEl[hasError ? 'addCls' : 'removeCls'](me.invalidCls + '-field');
    }
    me.mixins.labelable.renderActiveError.call(me);
  },

  initEvents: function() {
    var me = this;
    me.callParent();
    function clearError() {
      var me = this,
          hadError = me.hasActiveError();

      if (hadError) {
        me.unsetActiveError();
        me.inputValueTextEl.removeCls(me.invalidCls + '-field');
        me.doComponentLayout();
      }


    }

    me.mon(me.inputValueTextEl, 'keypress', clearError, me);
    if (me.maskRe) {
      me.mon(me.inputValueTextEl, 'keypress', me.filterKeys, me);
    }
  },
  initialSetValue:null,

  setValue:function(v) {
    var me = this,
        retVal, /*= me.callParent(arguments)*/
        radioGrpItemsArr,
        toSetNonBooleanValue = true;

    if (Ext.isBoolean(v)) {
      if (v) {
        if (me.inputValueTextEl) {
          me.inputValueTextEl.dom.disabled = false;
          me.inputValueTextEl.removeCls('x-item-disabled');
          if (me.initialSetValue) {
            me.inputValueTextEl.dom.value = me.initialSetValue;
            me.initialSetValue = null;
          }
        } else {
          //the only reason the element is not available is that it is not yet rendered
          me.on('render', function() {
            if (me.inputValueTextEl) {
              me.inputValueTextEl.dom.disabled = false;
              me.inputValueTextEl.removeCls('x-item-disabled');
              if (me.initialSetValue) {
                me.inputValueTextEl.dom.value = me.initialSetValue;
                me.initialSetValue = null;
              }
            }
          }, me, {single:true});

        }

      } else {
        if (me.inputValueTextEl) {
          me.inputValueTextEl.dom.disabled = true;
          me.inputValueTextEl.addCls('x-item-disabled');
        } else {
          //the only reason the element is not available is that it is not yet rendered
          me.on('render', function() {
            if (me.inputValueTextEl) {
              me.inputValueTextEl.dom.disabled = true;
              me.inputValueTextEl.addCls('x-item-disabled');
            }
          }, me, {single:true});

        }

      }

      me.callParent(arguments);
    }
    else {
      // if the passed value is not boolean
      radioGrpItemsArr = me.getManager().getRange();
      Ext.Array.each(radioGrpItemsArr, function(item) {
        if (item.inputValue && (item.inputValue === v)) {
          //value belongs to somebody else
          toSetNonBooleanValue = false;
          return false;
        }
      });
      if (toSetNonBooleanValue) {
        me.initialSetValue = v;
        me.setValue(true);
      }

    }


    return me;

  } ,
  //overriding from labelable
  //re-rendering is an issue calling its parents triggers a reflow through rendering engine
  getBodyNaturalWidth: function() {
    // return this.bodyEl.getWidth() + 50; //this.inputValueTextEl.getWidth()
    // return (this.callParent(arguments)+50);
    //return 167;
    if (! this.initialBodyNaturalWidth) {
      this.initialBodyNaturalWidth = this.callParent(arguments) + 18;
    }
    return this.initialBodyNaturalWidth;
  },
  //copied from Ext.form.field.Textfield

  filterKeys : function(e) {
    /*
     * On European keyboards, the right alt key, Alt Gr, is used to type certain special characters.
     * JS detects a keypress of this as ctrlKey & altKey. As such, we check that alt isn't pressed
     * so we can still process these special characters.
     */
    if (e.ctrlKey && !e.altKey) {
      return;
    }
    var key = e.getKey(),
        charCode = String.fromCharCode(e.getCharCode());

        if(Ext.isGecko && (e.isNavKeyPress() || key === e.BACKSPACE || (key === e.DELETE && e.button === -1))){
            return;
        }

    if (!Ext.isGecko && e.isSpecialKey() && !charCode) {
      return;
    }
    if (!this.maskRe.test(charCode)) {
      e.stopEvent();
    }
  }

});

/**
 * @class Ext.ux.form.field.InputRadioCompanion
 * @extends Ext.form.field.Radio
 * An extension to Ext.form.field.Radio that is exactly similar to a normal in behaviour and
 * appearance. It is intended to be used along with inputradio component in a radiogroup.
 * The overridden setValue and markInvalid methods faciliate data-binding and validation error
 *  propagation in a radiogroup with InputRadio.
 * @xtype inputradiocompanion
 *
 *  @author Suman Yadav <sumanyadav1812@gmail.com>
 */
Ext.define('Ext.ux.form.field.InputRadioCompanion', {
  extend:'Ext.form.field.Radio',
  alias:'widget.inputradiocompanion',
  setValue: function(v) {
    var me = this,
        active,siblingArr;

    if (!Ext.isBoolean(v)) {
      active = me.getManager().getWithValue(me.name, v).getAt(0);
      if (active) {
        active.setValue(true);
      }
      else {
        siblingArr = me.getManager().getByName(me.name);
        siblingArr.each(function(item) {
          if (item && item.xtype && item.xtype === 'inputradio') {
            //and xtype is inputRadio
            active = item;
            return false;
          }
        });
        if (active) {
          active.setValue(v);
        }
      }
    }
    else {
      me.callParent(arguments);
    }
    return me;
  },

  markInvalid:function() {
    var me = this,active,
         siblingArr = me.getManager().getByName(me.name);
    siblingArr.each(function(item) {
      if (item && item.xtype && item.xtype === 'inputradio') {
        //and xtype is inputRadio
        active = item;
        return false;
      }
    });
    //var inputRadioFld = this.up('radiogroup').down('inputradio');
    if(active)
      active.markInvalid.apply(active, arguments);
  }

});