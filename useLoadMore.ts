import {DependencyList, useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import {initializeApollo} from 'apollo/client';
import {ApolloQueryResult, DocumentNode} from '@apollo/client';
import {OperationVariables} from '@apollo/client/core/types';

import {IPaginationCallback, PAGINATION_INFO_DEFAULT} from 'components/common/Pagination';
import {IPaginationItems} from 'models/Common/IPaginatorInfo';

export default function useLoadMore<TModel, TData>(
    paginationItems: IPaginationItems<TModel> | undefined,
    query: DocumentNode,
    variables: OperationVariables,
    prepareData: (data: TData) => IPaginationItems<TModel> | undefined,
    deps: DependencyList = [],
    isPage = true,
) {
    const router = useRouter();

    const defaultState = {
        items: paginationItems?.data || [],
        paginatorInfo: paginationItems?.paginatorInfo || PAGINATION_INFO_DEFAULT,
    };

    const [
        {items, paginatorInfo},
        setItems,
    ] = useState(defaultState);

    useEffect(() => {
        setItems(defaultState);
    }, deps);

    const fetchItems = (page: number, url: string, isLoadMore: boolean = false) => {
        const client = initializeApollo();

        client.query({
            query: query,
            variables: {
                ...variables,
                page,
            },
        }).then(({data}: ApolloQueryResult<TData>) => {
            const paginationItemsFromData = prepareData(data);

            if (isLoadMore) {
                setItems({
                    items: [...(items || []), ...(paginationItemsFromData?.data || [])],
                    paginatorInfo: paginationItemsFromData?.paginatorInfo || PAGINATION_INFO_DEFAULT,
                });

                if (isPage)
                    router.push(url, undefined, {shallow: true});
            } else {
                setItems({
                    items: paginationItemsFromData?.data || [],
                    paginatorInfo: paginationItemsFromData?.paginatorInfo || PAGINATION_INFO_DEFAULT,
                });

                if (isPage) {
                    router.push(url, undefined, {shallow: true});
                    window.scrollTo(0, 0);
                }
            }
        });
    };

    const onPageChanged: IPaginationCallback = (page, url) => fetchItems(page, url, false);

    const onLoadMore: IPaginationCallback = (page, url) => fetchItems(page, url, true);

    return {
        items,
        paginatorInfo,
        onPageChanged,
        onLoadMore,
        setItems,
    };
}
