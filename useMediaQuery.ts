import {useEffect, useState} from 'react';

const useMediaQuery = (width: number, defaultTargetReached: boolean = false): boolean => {
    const [targetReached, setTargetReached] = useState<boolean>(defaultTargetReached);

    useEffect(() => {
        const updateTarget = (e: MediaQueryListEvent) => {
            if (e.matches) {
                setTargetReached(true);
            } else {
                setTargetReached(false);
            }
        };

        const media = window.matchMedia(`(max-width: ${width}px)`);

        if (media?.addEventListener) {
            media.addEventListener('change', updateTarget);
        } else {
            //deprecated method for old browser, remove after drop support
            media.addListener(updateTarget);
        }

        if (defaultTargetReached && !media.matches) {
            setTargetReached(false);
        } else if (!defaultTargetReached && media.matches) {
            setTargetReached(true);
        }

        return () => {
            media.removeEventListener('change', updateTarget);
        };
    }, [width, defaultTargetReached]);

    return targetReached;
};

const useIsMobile = () => useMediaQuery(640);

export {useMediaQuery, useIsMobile};
