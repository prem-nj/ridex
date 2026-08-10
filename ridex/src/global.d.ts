import { Connection } from "mongoose"

declare global{
    var mongooseconn:{
        conn:Connection | null,
        promise:Promise<Connection> | null
        }
}

export{}