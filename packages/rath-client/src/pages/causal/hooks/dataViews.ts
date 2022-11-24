import { useState, useMemo, useEffect } from "react";
import { applyFilters, IFilter } from '@kanaries/loa'
import { IRow } from "../../../interfaces";
import { focusedSample } from "../../../utils/sample";
import { useGlobalStore } from "../../../store";
import { baseDemoSample } from "../../painter/sample";

const VIZ_SUBSET_LIMIT = 2_000;
const SAMPLE_UPDATE_DELAY = 500;

/** 这是一个局部状态，不要在 causal page 以外的任何组件使用它 */
export function useDataViews (originData: IRow[]) {
    const { causalStore } = useGlobalStore();
    const { selectedFields } = causalStore;
    const [sampleRate, setSampleRate] = useState(1);
    const [appliedSampleRate, setAppliedSampleRate] = useState(sampleRate);
    const [filters, setFilters] = useState<IFilter[]>([]);
    const sampleSize = Math.round(originData.length * appliedSampleRate);
    const dataSource = useMemo(() => {
        return focusedSample(originData, selectedFields, sampleSize).map(i => originData[i]);
    }, [originData, selectedFields, sampleSize]);
    const dataSubset = useMemo(() => {
        return applyFilters(dataSource, filters);
    }, [dataSource, filters]);
    const vizSampleData = useMemo(() => {
        if (dataSubset.length < VIZ_SUBSET_LIMIT) {
            return dataSubset;
        }
        return baseDemoSample(dataSubset, VIZ_SUBSET_LIMIT);
    }, [dataSubset]);

    useEffect(() => {
        if (sampleRate !== appliedSampleRate) {
            const delayedTask = setTimeout(() => {
                setAppliedSampleRate(sampleRate);
            }, SAMPLE_UPDATE_DELAY);

            return () => {
                clearTimeout(delayedTask);
            };
        }
    }, [sampleRate, appliedSampleRate]);
    return {
        vizSampleData,
        dataSubset,
        sampleRate,
        setSampleRate,
        appliedSampleRate,
        setAppliedSampleRate,
        filters,
        setFilters,
        sampleSize
    }
}