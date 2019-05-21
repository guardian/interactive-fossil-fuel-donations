import * as d3 from 'd3';
import data from '../../../.data/candidates.json';

let width,
    height,
    ctx,
    ease = d3.easeCubicOut;

export default {
    init: function() {

        console.log(data);
        this.bindings();
        this.setupCanvas();
    },

    bindings: function() {
        $('.uit-visuals').on('shift', function(e) {
            console.log(e);
        })
    },

    setupCanvas: function() {
        width = $('.uit-visuals').width();
        height = $('.uit-visuals').height();

        const canvas = d3.select('.uit-visuals')
            .append('canvas')
            .attr('width', width)
            .attr('height', height);

        ctx = canvas.node().getContext('2d');
    }
};
