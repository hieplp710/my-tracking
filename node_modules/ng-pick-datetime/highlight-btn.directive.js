"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var picker_service_1 = require("./picker.service");
var utils_1 = require("./utils");
var HighlightBtnDirective = (function () {
    function HighlightBtnDirective(el, renderer, service) {
        this.el = el;
        this.renderer = renderer;
        this.service = service;
        this.themeColor = this.service.dtTheme;
        this.themeDarkColor = utils_1.shadeBlendConvert(-0.1, this.themeColor);
    }
    HighlightBtnDirective.prototype.ngOnInit = function () {
        this.highlight(this.themeColor);
    };
    HighlightBtnDirective.prototype.onMouseEnter = function () {
        this.highlight(this.themeDarkColor);
    };
    HighlightBtnDirective.prototype.onMouseLeave = function () {
        this.highlight(this.themeColor);
    };
    HighlightBtnDirective.prototype.highlight = function (bgColor) {
        this.renderer.setStyle(this.el.nativeElement, 'backgroundColor', bgColor);
    };
    return HighlightBtnDirective;
}());
HighlightBtnDirective.decorators = [
    { type: core_1.Directive, args: [{
                selector: '[pickerBtnHighlight]',
            },] },
];
HighlightBtnDirective.ctorParameters = function () { return [
    { type: core_1.ElementRef, },
    { type: core_1.Renderer2, },
    { type: picker_service_1.PickerService, },
]; };
HighlightBtnDirective.propDecorators = {
    'onMouseEnter': [{ type: core_1.HostListener, args: ['mouseenter',] },],
    'onMouseLeave': [{ type: core_1.HostListener, args: ['mouseleave',] },],
};
exports.HighlightBtnDirective = HighlightBtnDirective;
//# sourceMappingURL=highlight-btn.directive.js.map