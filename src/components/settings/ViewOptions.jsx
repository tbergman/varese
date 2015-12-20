import React, {Component, PropTypes} from 'react';

import CustomPropTypes from '../CustomPropTypes';
import LimitsOptions from './LimitsOptions';
import {Table, Row, Cell, LabelCell, CheckboxCell} from './SettingsTable';

/*
 * A settings widget to configure the 'treeViewOptions' state branch.
 * This can configure either the finite tree or the infinite tree,
 * depending on the values of 'isInfinite'.
 */
export default class ViewOptions extends Component {

    render() {
        const {infinite, values, handlers} = this.props;

        const levelStep = infinite ? 0.05 : 1;
        const levelMin = 1;
        const levelMax = 8;
        const levelValue = infinite ?
            values.infiniteLevels :
            values.levels;
        const levelSetter = infinite ?
            handlers.onSetInfiniteLevels :
            handlers.onSetLevels;
        return <div>
            <Table>
                <Row>
                    <LabelCell htmlFor="depth">Tree depth</LabelCell>
                    <LabelCell htmlFor="showRoots">Show roots?</LabelCell>
                    <LabelCell htmlFor="showOctaves">Show octaves?</LabelCell>
                    <LabelCell htmlFor="fillWindow">Fill window?</LabelCell>
                </Row>
                <Row>
                    <Cell>
                        <input
                            ref="levels"
                            type="range"
                            id="depth"
                            //
                            min={levelMin / levelStep}
                            max={levelMax / levelStep}
                            value={levelValue / levelStep}
                            onChange={() => levelSetter(levelStep *
                                parseInt(this.refs.levels.value, 10))}
                        />
                    </Cell>
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
                </Row>
            </Table>
            {infinite && <Table>
                <Row>
                    <LabelCell htmlFor="treeNumber">Tree number</LabelCell>
                    <LabelCell htmlFor="rootBass">Root chord bass</LabelCell>
                </Row>
                <Row>
                    <Cell>
                        <input
                            ref="treeNumber"
                            id="treeNumber"
                            type="number"
                            className="form-control"
                            //
                            min={0}
                            max={12}
                            value={values.treeNumber}
                            onChange={() => handlers.onSetTreeNumber(
                                parseInt(this.refs.treeNumber.value, 10))}
                        />
                    </Cell>
                    <Cell>
                        <input
                            ref="rootBass"
                            id="rootBass"
                            type="number"
                            className="form-control"
                            //
                            min={-24}
                            max={24}
                            value={values.rootBass}
                            onChange={() => handlers.onSetRootBass(
                                parseInt(this.refs.rootBass.value, 10))}
                        />
                    </Cell>
                </Row>
            </Table>}
            <LimitsOptions
                values={values.limits}
                handlers={{
                    onSetLimitValue: handlers.onSetLimitValue,
                    onSetLimitEnabled: handlers.onSetLimitEnabled,
                }}
            />
        </div>;
    }

}
ViewOptions.propTypes = {
    // false for finite tree, true for infinite tree
    infinite: PropTypes.bool.isRequired,
    values: CustomPropTypes.viewOptions.isRequired,
    handlers: CustomPropTypes.viewOptionsHandlers.isRequired,
};
