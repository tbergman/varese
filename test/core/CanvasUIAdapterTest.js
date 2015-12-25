import {describe, it} from 'mocha';
import {expect} from 'chai';

import {makeBox} from '../TestUtils';
import {initialState as initialReduxState} from '../TestData';
const {treeViewOptions: initialViewOptions} = initialReduxState;

import * as CanvasCore from '../../src/core/CanvasCore';
import {createHandlers, initialState} from '../../src/core/CanvasUIAdapter';

describe('CanvasUIAdapter', () => {
    // Fix some dimensions so we get predictable results.
    const baseDimensions = { width: 600, height: 400 };
    const baseViewOptions = {
        ...initialViewOptions,
        infiniteLevels: 4,
        infiniteHeight: baseDimensions.height,
    };
    //
    // Utilities for generating the initial canvas state
    // and setting the view options.
    const s0 = (viewOptions = baseViewOptions) =>
        CanvasCore.setViewOptions(
            CanvasCore.setCanvasWidth(
                CanvasCore.initialState(),
                baseDimensions.width),
            viewOptions);
    //
    // Allow overriding the (actually internal) 'position' field.
    const sp = (position, state = s0()) => ({ ...state, position });
    //
    // ...and do so easily with a helper function to save some typing.
    const xy = (x, y) => ({ x, y });

    const create = () => {
        const {getBox, setBox} = makeBox(initialState(s0()));
        return { getBox, setBox, handlers: createHandlers(getBox, setBox) };
    };

    describe('#initialState', () => {
        const coreState = s0();
        it("should be a function", () =>
            expect(initialState).to.be.a('function'));
        it("should return an object", () =>
            expect(initialState(coreState)).to.be.an('object'));
        it("should have a 'coreState' matching the input", () =>
            expect(initialState(coreState))
                .to.have.property('coreState')
                .that.deep.equals(coreState));
    });

    describe('#createHandlers', () => {
        it("should be a function", () =>
            expect(createHandlers).to.be.a('function'));
        it("should return an object", () =>
            expect(create()).to.be.an('object'));
        it("should return an object with at least one property", () =>
            expect(Object.keys(create().handlers)).to.have.length.at.least(1));
        it("should return an object all of whose values are functions", () => {
            const handlers = create().handlers;
            Object.keys(handlers).forEach(key =>
                expect(handlers[key]).to.be.a('function'));
        });
    });

    describe('handler onMouseDown', () => {
        const {getBox, handlers} = create();
        it("should be initialized with 'mouseDown' as false", () =>
            expect(getBox().mouseDown).to.equal(false));
        it("should set 'mouseDown' to true when false", () => {
            handlers.onMouseDown({});
            expect(getBox().mouseDown).to.equal(true);
        });
        it("should leave 'mouseDown' as true when already true", () => {
            handlers.onMouseDown({});
            expect(getBox().mouseDown).to.equal(true);
        });
    });

    describe('handler onMouseMove', () => {
        const {getBox, handlers} = create();
        it("should be initialized with a 'null' mouse position", () =>
            expect(getBox().lastMouse).to.equal(null));

        // Sample bounding rectangle for the canvas.
        // To produce this, just execute
        //     const canvas = document.getElementsByClassName('canvas')[0];
        //     canvas.getBoundingClientRect();
        // in a browser with the infinite canvas loaded.
        // (Of course, the values don't matter, but the shape does.)
        const boundingRect = {
            bottom: 800,
            height: 400,
            left: 300,
            right: 900,
            top: 200,
            width: 600,
        };
        const makeEvent = (relativeX, relativeY) => ({
            clientX: boundingRect.left + relativeX,
            clientY: boundingRect.top + relativeY,
            target: {
                getBoundingClientRect: () => boundingRect,
            },
        });
        it("should initialize 'lastMouse' while the mouse is up", () => {
            const e = makeEvent(200, 300);
            handlers.onMouseMove(e);
            expect(getBox().lastMouse).to.deep.equal(xy(200, 300));
            expect(getBox().coreState.position).to.deep.equal(xy(0, 0));
        });
        it("should update 'lastMouse' while the mouse is up", () => {
            const e = makeEvent(200, 250);  // 50px up from last
            handlers.onMouseMove(e);
            expect(getBox().lastMouse).to.deep.equal(xy(200, 250));
            expect(getBox().coreState.position).to.deep.equal(xy(0, 0));
        });
        it("when the mouse is down should pan and update 'lastMouse'", () => {
            handlers.onMouseDown({});
            const e = makeEvent(200, 100);  // 150px up from last
            handlers.onMouseMove(e);
            expect(getBox().lastMouse).to.deep.equal(xy(200, 100));
            expect(getBox().coreState.position).to.deep.equal(xy(0, 1.5));
        });
    });

    describe('handler onWheel', () => {

        // This one relies on document.activeElement for focus checking.
        // Happily, it looks like we can just set that property!
        const mockingFocus = (active, callback) => {
            const previouslyActive = document.activeElement;
            document.activeElement = active;
            callback();
            document.activeElement = previouslyActive;
        };
        const target = {};  // random dummy object to use for focusing

        const preventedDefault = makeBox(false);

        const {getBox, handlers} = create();
        const makeEvent = (deltaX, deltaY) => ({
            deltaX,
            deltaY,
            target,
            preventDefault: () => preventedDefault.setBox(true),
        });
        const resetPreventedDefault = () => preventedDefault.setBox(false);

        it("(1) should do nothing when scrolling while unfocused", () => {
            resetPreventedDefault();
            mockingFocus(null, () => handlers.onWheel(makeEvent(10, 20)));
            expect(preventedDefault.getBox()).to.equal(false);
            expect(getBox().coreState).to.deep.equal(s0());
        });

        it("then (2) should scroll vertically when focused", () => {
            resetPreventedDefault();
            mockingFocus(target, () => handlers.onWheel(makeEvent(0, 50)));
            expect(preventedDefault.getBox()).to.equal(true);
            expect(getBox().coreState.position).to.deep.equal(xy(0, 0.5));
        });

        it("then (3) should scroll diagonally", () => {
            resetPreventedDefault();
            mockingFocus(target, () => handlers.onWheel(makeEvent(300, 50)));
            expect(preventedDefault.getBox()).to.equal(true);
            expect(getBox().coreState.position).to.deep.equal(xy(0.25, 1));
        });

        it("then (4) should do nothing when unfocused again", () => {
            resetPreventedDefault();
            mockingFocus(null, () => handlers.onWheel(makeEvent(123, 234)));
            expect(preventedDefault.getBox()).to.equal(false);
            expect(getBox().coreState.position).to.deep.equal(xy(0.25, 1));
        });

        it("finally (5) should scroll horizontally", () => {
            resetPreventedDefault();
            mockingFocus(target, () => handlers.onWheel(makeEvent(-600, 0)));
            expect(preventedDefault.getBox()).to.equal(true);
            expect(getBox().coreState.position).to.deep.equal(xy(-0.25, 1));
        });

    });

    describe('handler onMouseUp', () => {
        const {getBox, handlers} = create();
        handlers.onMouseDown({});
        it("should set 'mouseDown' to false when true", () => {
            handlers.onMouseUp({});
            expect(getBox().mouseDown).to.equal(false);
        });
        it("should leave 'mouseDown' as false when already false", () => {
            handlers.onMouseUp({});
            expect(getBox().mouseDown).to.equal(false);
        });
    });

});
