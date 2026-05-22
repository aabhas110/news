import { ingestNews } from "@/lib/news/ingest";

ingestNews()
  .then((result) => {
    console.log(`Fetched ${result.fetched} articles, stored ${result.stored}.`);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
