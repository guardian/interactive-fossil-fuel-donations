// Javascript that is inline. Should be used for anything that needs to be immediate
import jquery from 'jquery';
window.$ = jquery;

import share from './modules/share.js';
import scroll from './modules/scroll.js';

share.init();
scroll.init();
