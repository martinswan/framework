import "dotenv/config";
import {csvFormat} from "d3-dsv";
import {json} from "d3-fetch";
import {timeDay, timeHour, utcDay} from "d3-time";

// Access key from .env
const {EIA_KEY} = process.env;

// Start and end dates
const end = timeDay.offset(timeHour(new Date()), 1);
const start = timeHour(utcDay.offset(end, -7));
const dataLength = 5000;

// BA Hourly Demand
const regions = new Set(["California", "Carolinas", "Central", "Florida", "Mid-Atlantic", "Midwest", "New England", "New York", "Northwest", "Southeast", "Southwest", "Tennessee", "Texas", "United States Lower 48"]);
const baHourlyUrl = `https://api.eia.gov/v2/electricity/rto/region-data/data/?api_key=${EIA_KEY}&frequency=hourly&data[0]=value&start=${start.toISOString().substring(0, 10)}T00&end=${end.toISOString().substring(0, 10)}T00&sort[0][column]=period&sort[0][direction]=desc&offset=0&length=${dataLength}`;
const baHourly = (await json(baHourlyUrl)).response.data
  .filter((d) => d.type == "D")  // Only use demand ("D")
  .filter((d) => !regions.has(d["respondent-name"]))  // Only use demand ("D")
  .map((d) => ({
    period: d.period,
    ba: d["respondent-name"],
    baAbb: d.respondent,
    value: d.value
  }));

process.stdout.write(csvFormat(baHourly));
