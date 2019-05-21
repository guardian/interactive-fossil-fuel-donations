import * as d3 from 'd3';
import data from '../../../.data/candidates.json';

const radius = 32;
let width,
    height,
    ctx,
    ease = d3.easeCubicOut,
    timer;

export default {
    init: function() {
        this.bindings();
        this.sortData();
        this.setupCanvas();
    },

    bindings: function() {
        $('.uit-visuals').on('shift', function(e) {
            this.drawCandidates();
        }.bind(this))
    },

    sortData: function() {
        data.sort(function(a, b) {
            return a.candidate - b.candidate;
        });
    },

    setupCanvas: function() {
        width = $('.uit-visuals').width();
        height = $('.uit-visuals').height();

        const canvas = d3.select('.uit-visuals')
            .append('canvas')
            .attr('width', width)
            .attr('height', height);

        ctx = canvas.node().getContext('2d');
    },

    drawCandidates: function() {
        this.getPositions();
    },

    getPositions: function() {
        let activeSlide = parseInt($('.uit-visuals').attr('data-set'));
        let positions;

        if (activeSlide === 0) {
            let levels = [];
            levels.push({
                id: 'pledged',
                parentId: null
            });

            levels.push({
                id: 'true',
                parentId: 'pledged'
            });

            levels.push({
                id: 'false',
                parentId: 'pledged'
            });

            for (var i in data) {
                levels.push({
                    id: data[i].candidate,
                    parentId: data[i].pledged ? 'true' : 'false',
                    value: 1
                });
            }

            let root = d3.stratify()
                (levels)
                .sum(function(d) { return d.value })
                .sort(function(a, b) { return b.value - a.value });

            let pack = d3.pack()
                .size([width, height - 100])
                .radius(function(d) { return radius; })
                .padding(function(d) { return 4; });

            let packed = pack(root);

            this.animate(packed.leaves());
        } else if (activeSlide === 1) {
            let levels = [];
            levels.push({
                id: 'candidates',
                parentId: null
            });

            for (var i in data) {
                levels.push({
                    id: data[i].candidate,
                    parentId: 'candidates',
                    value: data[i].total || 0
                });
            }

            let root = d3.stratify()
                (levels)
                .sum(function(d) { return d.value })
                .sort(function(a, b) { return b.value - a.value });

            let pack = d3.pack()
                .size([width, height - 100])
                .padding(function(d) { return 4; });

            let packed = pack(root);

            this.animate(packed.leaves());
        }
    },

    animate: function(positionedData) {
        positionedData.sort(function(a,b) {
            return a.id - b.id;
        });

        data.forEach(function(candidate, i) {
            candidate.sx = candidate.x || width / 2;
            candidate.sy = candidate.y || height / 2;
            candidate.sr = candidate.r || radius;
            candidate.so = candidate.o || 1;
            candidate.tx = positionedData[i].x;
            candidate.ty = positionedData[i].y;
            candidate.tr = positionedData[i].r || radius;
            candidate.to = 1;
        }.bind(this));

        if (timer !== undefined) {
            timer.stop();
        }

        timer = d3.timer(function(elapsed) {
            var t = Math.min(1, ease(elapsed / 800));
            data.forEach(function(candidate, i) {
                candidate.x = candidate.sx * (1 - t) + candidate.tx * t;
                candidate.y = candidate.sy * (1 - t) + candidate.ty * t;
                candidate.r = candidate.sr * (1 - t) + candidate.tr * t;
            });

            this.draw();
            if (t === 1) {
                timer.stop();
            }
        }.bind(this), 0)
    },

    draw: function() {
        ctx.clearRect(0, 0, width, height);
        ctx.save();

        data.forEach(function(d) {
            ctx.fillStyle = 'rgb(199, 0, 0)';
            ctx.beginPath();
            ctx.moveTo(d.x + d.r, d.y);
            ctx.arc(d.x, d.y, d.r, 0, 2 * Math.PI);
            ctx.fill();
        }.bind(this));

        ctx.restore();
    }
};
