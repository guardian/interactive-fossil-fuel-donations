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
        this.loadImages();
        this.bindings();
        this.sortData();
        this.setupCanvas();
    },

    loadImages: function() {
        data.forEach(function(d) {
            let image = new Image();
                image.src = '/assets/' + this.handlise(d.candidate) + '.png';
                image.onload = function() {
                    d.image = image;
                }.bind(this);
        }.bind(this));
    },

    bindings: function() {
        $('.uit-visuals').on('shift', function(e) {
            this.drawCandidates();
        }.bind(this))
    },

    sortData: function() {
        data.sort(function(a, b) {
            var textA = a.candidate.toUpperCase();
            var textB = b.candidate.toUpperCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
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
            let levels = {};

            levels.true = [];
            levels.true.push({
                id: 'true',
                parentId: null
            });

            levels.false = [];
            levels.false.push({
                id: 'false',
                parentId: null
            });

            for (var i in data) {
                const pledged = data[i].pledged ? 'true' : 'false';
                levels[pledged].push({
                    id: data[i].candidate,
                    parentId: pledged,
                    value: radius * 2
                });
            }

            let rootTrue = d3.stratify()
                (levels.true)
                .sum(function(d) { return d.value })
                .sort(function(a, b) { return b.value - a.value });

            let rootFalse = d3.stratify()
                (levels.false)
                .sum(function(d) { return d.value })
                .sort(function(a, b) { return b.value - a.value });

            let packTrue = d3.pack()
                .size([width, height / 1.5])
                .radius(function(d) { return radius; })
                .padding(function(d) { return 20; });

            let packFalse = d3.pack()
                .size([width, height / 1.5])
                .radius(function(d) { return radius; })
                .padding(function(d) { return 20; });

            let packedTrue = packTrue(rootTrue);
            let packedFalse = packTrue(rootFalse);

            let leaves = packedTrue.leaves();
                leaves = leaves.concat(packedFalse.leaves());

            for (var i in leaves) {
                if (leaves[i].data.parentId === 'false') {
                    leaves[i].y += height / 3;
                }
            }

            this.animate(leaves);
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
        positionedData.sort(function(a, b) {
            var textA = a.id.toUpperCase();
            var textB = b.id.toUpperCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });

        data.forEach(function(candidate, i) {
            candidate.fill = candidate.pledged ? 'rgb(0, 132, 198)' : 'rgb(199, 0, 0)';
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
            ctx.fillStyle = d.fill;
            ctx.beginPath();
            ctx.moveTo(d.x + d.r, d.y);
            ctx.arc(d.x, d.y, d.r, 0, 2 * Math.PI, true);
            ctx.fill();

            if (d.image) {
                ctx.save();
                ctx.beginPath();
                ctx.arc(d.x, d.y, d.r, 0, 2 * Math.PI, true);
                ctx.closePath();
                ctx.clip();

                ctx.drawImage(d.image, d.x - d.r, d.y - d.r, d.r * 2, d.r * 2);
                ctx.restore();
            }

        }.bind(this));

        ctx.restore();
    },

    handlise: function(string) {
        if (string) {
            return string.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ /g, '-').replace('\'', '').toLowerCase();
        }
    }
};
