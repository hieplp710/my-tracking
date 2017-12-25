import { ElementRef, OnInit, Renderer2 } from '@angular/core';
import { PickerService } from './picker.service';
export declare class HighlightBtnDirective implements OnInit {
    private el;
    private renderer;
    private service;
    private themeColor;
    private themeDarkColor;
    constructor(el: ElementRef, renderer: Renderer2, service: PickerService);
    ngOnInit(): void;
    onMouseEnter(): void;
    onMouseLeave(): void;
    private highlight(bgColor);
}
