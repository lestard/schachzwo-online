(function ($) {

    var Color = {
        BLACK: "black",
        WHITE: "white"
    };


    $.widget('custom.schachzwo', {

        options: {

            boardSize: 9,
            self: Color.BLACK,
            boardBorderColor: "#ED8641",
            boardCaptionColor: "#000000",
            boardBlackFieldColor: "#BE5003",
            boardWhiteFieldColor: "#F8D48A",
            boardSelectedFieldColor: "rgba(61,158,255,0.6)",
            boardAccessibleFieldColor: "rgba(61,255,60,0.4)",
            boardThreateningFieldColor: "rgba(255,60,60,0.6)",
            figureBlackColor: "#000000",
            figureWhiteColor: "#FFFFFF",
            figureBlackBorderColor: "gray",
            figureWhiteBorderColor: "#000000"

        },

        _create: function () {
            this.canvas = $('<canvas>');
            this.element.append(this.canvas);
            this.canvasContext = this.canvas.get(0).getContext('2d');

            this._on(this.window, {'resize': function () {
                this._respond();
            }});

            this._on(this.canvas, {'click': function (e) {

                var x = e.pageX - this.canvas.offset().left - this.x0;
                var y = e.pageY - this.canvas.offset().top - this.y0;

                if (x >= 0 && x <= this.fieldSize * this.options.boardSize &&
                    y >= 0 && y <= this.fieldSize * this.options.boardSize) {

                    var column = this._transformColumn(Math.floor(x / this.fieldSize));
                    var row = this._transformRow(Math.floor(y / this.fieldSize));
                    this._trigger("onSelect", null, { column: column, row: row });

                }
            }});

            this._respond();
        },

        show: function (fields) {
            this.fields = fields;
            var width = this.canvas.attr('width');
            var height = this.canvas.attr('height');
            this._draw(Math.min(width, height));
        },

        _respond: function () {

            var container = this.canvas.parent();

            var width = container.width();
            var height = window.innerHeight - 200;
            var boardWidth = Math.min(width, height);
            this.canvas.attr('width', boardWidth);
            this.canvas.attr('height', boardWidth);

            this._draw(boardWidth);
        },

        _checkColor: function (color) {
            if (color !== Color.BLACK && color !== Color.WHITE) {
                throw "Invalid color, it should be 'black' or 'white'.";
            }
        },

        _checkColRow: function (val) {
            if (val < 0 || val >= this.options.boardSize) {
                throw "Invalid value, it can only be a number between 0 and " + this.options.boardSize + ".";
            }
        },

        _checkBoardSize: function (boardSize) {
            if (boardSize != 7 && boardSize != 9) {
                throw "Invalid board size, it should be 7 or 9.";
            }
        },

        _transformColumn: function (column) {
            return this.options.self === Color.BLACK ? column : this.options.boardSize - column - 1;
        },

        _transformRow: function (row) {
            return this.options.self === Color.BLACK ? row : this.options.boardSize - row - 1;
        },

        _draw: function (boardWidth) {

            var context = this.canvasContext;
            var boardSize = this.options.boardSize;
            var self = this.options.self;
            var boardBorderColor = this.options.boardBorderColor;
            var boardCaptionColor = this.options.boardCaptionColor;
            var boardBlackFieldColor = this.options.boardBlackFieldColor;
            var boardWhiteFieldColor = this.options.boardWhiteFieldColor;
            var boardSelectedFieldColor = this.options.boardSelectedFieldColor;
            var boardAccessibleFieldColor = this.options.boardAccessibleFieldColor;
            var boardThreateningFieldColor = this.options.boardThreateningFieldColor;
            var figureBlackColor = this.options.figureBlackColor;
            var figureWhiteColor = this.options.figureWhiteColor;
            var figureBlackBorderColor = this.options.figureBlackBorderColor;
            var figureWhiteBorderColor = this.options.figureWhiteBorderColor;

            this._checkBoardSize(boardSize);

            var border = (3 / 100) * boardWidth;
            boardWidth -= 2 * border;

            var x0 = border;
            var y0 = border;
            var fieldSize = boardWidth / boardSize;

            this.x0 = x0;
            this.y0 = y0;
            this.fieldSize = fieldSize;

            var rect = function (x, y, w, h) {
                context.beginPath();
                context.rect(x, y, w, h);
                context.closePath();
                context.fill();
            };

            var fillFloor = function (row, column, color) {
                context.fillStyle = color;
                rect(x0 + column * fieldSize, y0 + row * fieldSize, fieldSize, fieldSize);
            };

            var drawFloor = function (row, column) {
                fillFloor(row, column, (row * boardSize + column) % 2 === 0 ? boardWhiteFieldColor : boardBlackFieldColor);
            };


            var drawFigure = function (row, column, figure) {

                var fillFigure = function (color) {
                    context.fillStyle = color === Color.WHITE ? figureWhiteColor : figureBlackColor;
                    context.fill();
                    context.lineWidth = 1 / 30 * fieldSize;
                    context.strokeStyle = color === Color.WHITE ? figureWhiteBorderColor : figureBlackBorderColor;
                    context.stroke();
                };

                var figures = {

                    rocks: function (row, column, color) {
                        context.beginPath();
                        context.rect(x0 + (column + (11 / 28)) * fieldSize, y0 + (row + (2 / 7)) * fieldSize, (3 / 14) * fieldSize, (3 / 7) * fieldSize);
                        fillFigure(color);

                    },

                    man: function (row, column, color) {
                        context.beginPath();
                        context.rect(x0 + (column + (1 / 4)) * fieldSize, y0 + (row + (1 / 4)) * fieldSize, (1 / 2) * fieldSize, (1 / 2) * fieldSize);
                        fillFigure(color);
                    },

                    woman: function (row, column, color) {
                        context.beginPath();
                        context.arc(x0 + (column + (1 / 2)) * fieldSize, y0 + (row + (1 / 2)) * fieldSize, Math.sqrt(1 / (4 * Math.PI)) * fieldSize, 0, 2 * Math.PI, false);
                        fillFigure(color);
                    },

                    knight: function (row, column, color) {
                        context.beginPath();
                        context.moveTo(x0 + (column + (29 / 140)) * fieldSize, y0 + (row + (3 / 4)) * fieldSize);
                        context.lineTo(x0 + (column + (111 / 140)) * fieldSize, y0 + (row + (3 / 4)) * fieldSize);
                        context.lineTo(x0 + (column + (111 / 140)) * fieldSize, y0 + (row + (19 / 28)) * fieldSize);
                        context.lineTo(x0 + (column + (1 / 2)) * fieldSize, y0 + (row + (37 / 140)) * fieldSize);
                        context.lineTo(x0 + (column + (29 / 140)) * fieldSize, y0 + (row + (19 / 28)) * fieldSize);
                        context.lineTo(x0 + (column + (29 / 140)) * fieldSize, y0 + (row + (3 / 4)) * fieldSize);
                        context.closePath();
                        fillFigure(color);
                    },

                    knowledge: function (row, column, color) {
                        context.beginPath();
                        context.moveTo(x0 + (column + (1 / 5)) * fieldSize, y0 + (row + (4 / 5)) * fieldSize);
                        context.lineTo(x0 + (column + (4 / 5)) * fieldSize, y0 + (row + (4 / 5)) * fieldSize);
                        context.lineTo(x0 + (column + (4 / 5)) * fieldSize, y0 + (row + (23 / 35)) * fieldSize);
                        context.lineTo(x0 + (column + (9 / 14)) * fieldSize, y0 + (row + (23 / 35)) * fieldSize);
                        context.lineTo(x0 + (column + (5 / 7)) * fieldSize, y0 + (row + (1 / 5)) * fieldSize);
                        context.lineTo(x0 + (column + (2 / 7)) * fieldSize, y0 + (row + (1 / 5)) * fieldSize);
                        context.lineTo(x0 + (column + (5 / 14)) * fieldSize, y0 + (row + (23 / 35)) * fieldSize);
                        context.lineTo(x0 + (column + (1 / 5)) * fieldSize, y0 + (row + (23 / 35)) * fieldSize);
                        context.lineTo(x0 + (column + (1 / 5)) * fieldSize, y0 + (row + (4 / 5)) * fieldSize);
                        context.closePath();
                        fillFigure(color);
                    },

                    faith: function (row, column, color) {
                        context.beginPath();
                        context.moveTo(x0 + (column + (1 / 5)) * fieldSize, y0 + (row + (4 / 5)) * fieldSize);
                        context.lineTo(x0 + (column + (4 / 5)) * fieldSize, y0 + (row + (4 / 5)) * fieldSize);
                        context.lineTo(x0 + (column + (4 / 5)) * fieldSize, y0 + (row + (23 / 35)) * fieldSize);
                        context.lineTo(x0 + (column + (5 / 7)) * fieldSize, y0 + (row + (23 / 35)) * fieldSize);
                        context.lineTo(x0 + (column + (9 / 14)) * fieldSize, y0 + (row + (1 / 5)) * fieldSize);
                        context.lineTo(x0 + (column + (5 / 14)) * fieldSize, y0 + (row + (1 / 5)) * fieldSize);
                        context.lineTo(x0 + (column + (2 / 7)) * fieldSize, y0 + (row + (23 / 35)) * fieldSize);
                        context.lineTo(x0 + (column + (1 / 5)) * fieldSize, y0 + (row + (23 / 35)) * fieldSize);
                        context.lineTo(x0 + (column + (1 / 5)) * fieldSize, y0 + (row + (4 / 5)) * fieldSize);
                        context.closePath();
                        fillFigure(color);
                    },

                    zenith: function (row, column, color) {
                        var zenithY = self === color ? (5 / 14) : (9 / 14);

                        if (row === (boardSize - 1) / 2 && column === (boardSize - 1) / 2)
                            zenithY = 1 / 2;

                        context.beginPath();
                        context.arc(x0 + (column + (1 / 2)) * fieldSize, y0 + (row + zenithY) * fieldSize, (3 / 7) * fieldSize, 0, Math.PI, self !== color);
                        context.closePath();
                        fillFigure(color);
                        context.beginPath();
                        context.arc(x0 + (column + (1 / 2)) * fieldSize, y0 + (row + zenithY) * fieldSize, (3 / 14) * fieldSize, 0, Math.PI, self !== color);
                        context.closePath();
                        context.fillStyle = color === Color.BLACK ? figureWhiteColor : figureBlackColor;
                        context.fill();
                    }

                };

                figures[figure.type](row, column, figure.color);

            };


            var drawBoard = function () {

                var drawCenter = function () {
                    context.beginPath();
                    context.arc(x0 + ((boardSize - 1) / 2 + 1 / 2) * fieldSize, y0 + ((boardSize - 1) / 2 + 1 / 2) * fieldSize, (4 / 14) * fieldSize, 0, 2 * Math.PI, true);
                    context.closePath();
                    context.lineWidth = 2 / 30 * fieldSize;
                    context.strokeStyle = boardBorderColor;
                    context.stroke();
                };

                var drawCaptions = function () {
                    var fontSize = border - 4;
                    context.textBaseline = "top";
                    context.textAlign = "center";
                    context.fillStyle = boardCaptionColor;
                    context.font = "bold " + fontSize + "px Arial";

                    for (var i = 0; i < boardSize; i++) {

                        var letter = String.fromCharCode(self === Color.BLACK ? 65 + i : 64 + (boardSize - i));
                        var number = String.fromCharCode(self === Color.BLACK ? 48 + (boardSize - i) : 49 + i);

                        context.fillText(letter, x0 + (fieldSize * i) + fieldSize / 2, y0 - border + (border - fontSize) / 2 - 1);
                        context.fillText(letter, x0 + (fieldSize * i) + fieldSize / 2, y0 + fieldSize * boardSize + (border - fontSize) / 2 - 1);
                        context.fillText(number, x0 - border / 2, y0 + (fieldSize * i) + (fieldSize - fontSize) / 2);
                        context.fillText(number, x0 + fieldSize * boardSize + border / 2, y0 + (fieldSize * i) + (fieldSize - fontSize) / 2);
                    }

                };

                context.fillStyle = boardBorderColor;
                rect(x0 - border, y0 - border, boardWidth + 2 * border, boardWidth + 2 * border);

                for (var row = 0; row < boardSize; row++) {
                    for (var column = 0; column < boardSize; column++) {
                        drawFloor(row, column);
                    }
                }

                drawCenter();

                if (boardWidth > 400) {
                    drawCaptions();
                }
            }();

            for (var i in this.fields) {
                var field = this.fields[i];

                var row = field.position.row;
                var column = field.position.column;

                this._checkColRow(row);
                this._checkColRow(column);

                if (field.selected) {
                    fillFloor(this._transformRow(row), this._transformColumn(column), boardSelectedFieldColor);
                }
                if (field.accessible) {
                    fillFloor(this._transformRow(row), this._transformColumn(column), boardAccessibleFieldColor);
                }
                if (field.threatening) {
                    fillFloor(this._transformRow(row), this._transformColumn(column), boardThreateningFieldColor);
                }
            }

            for (var i in this.fields) {
                var field = this.fields[i];
                if (field.figure) {

                    this._checkColor(field.figure.color);
                    drawFigure(this._transformRow(field.position.row), this._transformColumn(field.position.column), field.figure);
                }
            }

        }

    });

}(jQuery));
