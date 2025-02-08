import { DatabaseService } from "../../services/database.service";
import { BroadcastModel } from "../driver/BroadcastMode";

export class BroadcastRepository {
  private dbService: DatabaseService;

  constructor() {
    this.dbService = DatabaseService.getInstance();
  }

  async create(payload: any) {
    const broadcast = new BroadcastModel(payload);
    const b = await broadcast.save();
    console.log('BroadcastRepository -> create -> b:', b);
  }

  async accept(id: string) {
    return await BroadcastModel.findOneAndUpdate({
      _id: id
    }, {
      status: 'accepted'
    }, { new: true })
  }


  async reject(id: string, driverId: string) {
    const broadcast = await BroadcastModel.findOne({ _id: id });

    console.log("broadcast: ", broadcast)
    
    const newCurrent = broadcast?.drivers.shift();
    console.log("newCurrent: ", newCurrent)
    console.log("broadcast?.drivers: ", broadcast?.drivers)
    if (broadcast && broadcast?.drivers && newCurrent) {

      await BroadcastModel.findOneAndUpdate({
        _id: id
      }, {
        drivers: broadcast?.drivers,
        currentDriver: newCurrent,
        cancelledDrivers: [...broadcast.cancelledDrivers, broadcast.currentDriver]
      })

      return;
    } 

    if (!broadcast) {
      return;
    }

    await BroadcastModel.findOneAndUpdate({ _id: id }, {
      currentDriver: null,
      status: 'cancelled',
      cancelledDrivers: [...broadcast.cancelledDrivers, broadcast.currentDriver]
    })

  }
}
