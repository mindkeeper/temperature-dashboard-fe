implement another card on head office dashboard. this is going to be a line chart that shows timeseries of the temperature based on its concessionaire id. you can look at the api integrations on the temperature-dashboard nestjs repo on stats module. here are the following requirements for the frontend integrations

- it should have a shadcn combobox to select the concess to provide concess id for parameter, the combobox should be searchable and debounced using useDebounce callback from usehooks package. when the concess is not yet selected, the card should display a message to select the concess first
- the combobox select should use infiniteQuery from tanstack and fetch next page if the next page is still available
- when concess are selected, it should show a chart for timeseries data for multiple warehouse from the api if its more than one. and the kpi for that timeseries should be below the chart
- there should be a date range to for startDate and endDate too
- when there are multiple warehouse and the one of the warehosue timeseries chart are clilcked. it should focus on that and blur the other
- the chart should have a horizontal threshold of temperature in -10 celcius

use brainstorming skills
