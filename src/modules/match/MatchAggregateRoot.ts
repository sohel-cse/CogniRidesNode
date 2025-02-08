export class GetMatchAggregateRoot {
    startBroadcast(drives: any[], events: any[]) {

        // sort drivers
        // perform other logics
        // handle validation
        const firstDriver = drives.shift();
        console.log(' --------------------------------------------------------------------');
        console.log('GetMatchAggregateRoot -> startBroadcast -> firstDriver:', firstDriver);
        console.log(' --------------------------------------------------------------------');
        events.push({
            success: true,
            payload: {
                drivers:drives,
                currentDriver: firstDriver,
                startTime: new Date(),
                endTime: new Date(new Date().getTime() + 1 * 10 * 1000),
                expireAt: new Date(new Date().getTime() + 5 * 5 * 60 * 1000),
                cancelledDrivers: []
            }
        });

        return drives;
    }
}