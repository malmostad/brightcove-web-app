define(function (require) {

    'use strict';

    var _ = require('underscore');
    var reducer = function (state, action) {
        switch (action.type) {
            case 'SET_VIEW':
                return _.extend({}, state, { view: action.name });
            default:
                return state;
        }
    };

    return reducer;
});