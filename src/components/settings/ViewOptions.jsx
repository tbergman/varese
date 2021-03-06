import React, {Component, PropTypes} from 'react';

import CustomPropTypes from '../CustomPropTypes';
import LimitsOptions from './LimitsOptions';
import StackedNoteInput from '../StackedNoteInput';
import {Table, Row, Cell, LabelCell, CheckboxCell} from './SettingsTable';

/*
 * A settings widget to configure the 'treeViewOptions' state branch.
 * This can configure either the finite tree or the infinite tree,
 * depending on the values of 'isInfinite'.
 */
export default class ViewOptions extends Component {

    constructor() {
        super();
        this.state = {
            showLimits: true,
            showTreeConfiguration: true,
            showDisplay: true,
            showAdvanced: false,
        };
    }

    render() {
        const {infinite, values, handlers} = this.props;

        // Toggle one of the 'showFoo' state fields.
        const ToggleButton = ({field, label}) => {
            const value = this.state[field];
            const handler = () => this.setState({ [field]: !value });
            const btnClass = value ? "btn-primary" : "btn-default";
            return <button
                className={`btn ${btnClass}`}
                onClick={handler}
            >{label}</button>;
        };
        ToggleButton.propTypes = {
            field: PropTypes.oneOf(Object.keys(this.state)).isRequired,
            label: PropTypes.node.isRequired,
        };

        return <div>
            <div className="btn-group" style={{ marginBottom: 20 }}>
                <span className="btn btn-default" disabled>
                    <strong>Show:</strong>
                </span>
                <ToggleButton field="showLimits" label="Interval limits" />
                {infinite && <ToggleButton
                    field="showTreeConfiguration"
                    label="Tree configuration"
                />}
                <ToggleButton field="showDisplay" label="Display settings" />
                {infinite && <ToggleButton
                    field="showAdvanced"
                    label="Advanced settings" />}
            </div>
            {this.state.showLimits && <LimitsOptions
                values={values.limits}
                handlers={{
                    onSetLimitValue: handlers.onSetLimitValue,
                    onSetLimitEnabled: handlers.onSetLimitEnabled,
                }}
            />}
            {infinite && this.state.showTreeConfiguration && <Table>
                <Row>
                    <LabelCell htmlFor="treeNumber">Tree number</LabelCell>
                    <LabelCell htmlFor="rootBass">Root chord bass</LabelCell>
                </Row>
                <Row>
                    <Cell>
                        <input
                            id="treeNumber"
                            type="number"
                            className="form-control"
                            //
                            min={0}
                            max={12}
                            value={values.treeNumber}
                            onChange={e => handlers.onSetTreeNumber(
                                e.target.valueAsNumber)}
                        />
                    </Cell>
                    <Cell>
                        <StackedNoteInput
                            value={[values.rootBass]}
                            onChange={arr => handlers.onSetRootBass(arr[0])}
                            className="form-control"
                            viewOptions={values}
                            inputProps={{ className: "form-control", size: 3 }}
                        />
                    </Cell>
                </Row>
            </Table>}
            {this.state.showDisplay && <Table>
                <Row>
                    {!infinite &&
                        <LabelCell htmlFor="depth">Tree depth</LabelCell>}
                    <LabelCell htmlFor="showRoots">Show roots?</LabelCell>
                    <LabelCell htmlFor="showOctaves">Show octaves?</LabelCell>
                    <LabelCell htmlFor="fillWindow">Fill window?</LabelCell>
                    {infinite && <LabelCell
                        htmlFor="alwaysEngrave"
                    >Engrave notes</LabelCell>}
                </Row>
                <Row>
                    {!infinite && <Cell>
                        <input
                            type="range"
                            id="depth"
                            //
                            min={1}
                            max={8}
                            value={values.levels}
                            onChange={e => handlers.onSetLevels(
                                e.target.valueAsNumber)}
                        />
                    </Cell>}
                    <CheckboxCell
                        id="showRoots"
                        checked={values.showRoots}
                        onChange={handlers.onSetShowRoots}
                        labelYes="Shown"
                        labelNo="Hidden"
                    />
                    <CheckboxCell
                        id="showOctaves"
                        checked={values.showOctaves}
                        onChange={handlers.onSetShowOctaves}
                        labelYes="Shown"
                        labelNo="Hidden"
                    />
                    <CheckboxCell
                        id="fillWindow"
                        checked={values.wide}
                        onChange={handlers.onSetWide}
                        labelYes="Wide"
                        labelNo="Inline"
                    />
                    {infinite && <CheckboxCell
                        id="alwaysEngrave"
                        checked={values.alwaysEngrave}
                        onChange={handlers.onSetAlwaysEngrave}
                        labelYes="Always"
                        labelNo="Hover only"
                    />}
                </Row>
            </Table>}
            {infinite && this.state.showDisplay && <Table>
                <Row>
                    <LabelCell htmlFor="depth">Levels shown</LabelCell>
                    <LabelCell htmlFor="height">Height</LabelCell>
                </Row>
                <Row>
                    <Cell>
                        <input
                            type="range"
                            id="depth"
                            //
                            min={1}
                            max={9}
                            step={0.05}
                            value={values.infiniteLevels}
                            onChange={e => handlers.onSetInfiniteLevels(
                                e.target.valueAsNumber)}
                        />
                    </Cell>
                    <Cell>
                        <input
                            type="range"
                            id="height"
                            //
                            min={500}
                            max={1000}
                            value={values.infiniteHeight}
                            onChange={e => handlers.onSetInfiniteHeight(
                                e.target.valueAsNumber)}
                        />
                    </Cell>
                </Row>
            </Table>}
            {infinite && this.state.showAdvanced && <Table>
                <Row>
                    <LabelCell htmlFor="highQuality">
                        Display quality
                    </LabelCell>
                    <LabelCell
                        htmlFor="rainbowFactor"
                        aria-label="Rainbow factor"
                    >
                        {(() => {
                            const rainbow = "Rainbow".split('');
                            return rainbow.map((chr, idx) => {
                                // Compute a simple rainbow gradient,
                                // but decrease the lightness near cyan
                                // because it's hard to see.
                                const t = idx / rainbow.length;
                                const hue = t * 360;
                                const sigma = 0.1;
                                const crit = 0.5;
                                const base = 0.5;
                                const drop = 0.1;
                                const lit = Math.abs(t - crit) > sigma ?
                                    base :
                                    base - drop * Math.exp(1 - 1 /
                                        (1 - Math.pow((t - crit) / sigma, 2)));
                                const hsl = `hsl(${hue}, 50%, ${lit * 100}%)`;
                                return <span
                                    style={{ color: hsl }}
                                    key={idx}
                                >{chr}</span>;
                            });
                        })()} factor
                    </LabelCell>
                </Row>
                <Row>
                    <CheckboxCell
                        id="highQuality"
                        checked={values.highQuality}
                        onChange={handlers.onSetHighQuality}
                        labelYes="Pretty"
                        labelNo="Fast"
                    />
                    <Cell>
                        <input
                            type="range"
                            id="rainbowFactor"
                            //
                            min={0}
                            max={1}
                            step={0.05}
                            value={values.rainbowFactor}
                            onChange={e => handlers.onSetRainbowFactor(
                                e.target.valueAsNumber)}
                        />
                    </Cell>
                </Row>
            </Table>}
        </div>;
    }

}
ViewOptions.propTypes = {
    // false for finite tree, true for infinite tree
    infinite: PropTypes.bool.isRequired,
    values: CustomPropTypes.viewOptions.isRequired,
    handlers: CustomPropTypes.viewOptionsHandlers.isRequired,
};
