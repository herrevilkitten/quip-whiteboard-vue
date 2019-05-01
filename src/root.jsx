import quip from "quip";

import Vue from 'vue/dist/vue';

import App from './App.vue';

Vue.component('App', App);

quip.apps.initialize({
    initializationCallback: function (rootNode, params) {
        quip.apps.setWidthAndAspectRatio(300, 1);
        quip.apps.enableResizing();

        const container = document.createElement('div');
        rootNode.appendChild(container);
        new Vue({
            el: container,
            render: function (h) {
                return h(App, { props: params });
            }
        });
    },
});