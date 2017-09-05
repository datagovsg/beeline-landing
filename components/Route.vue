<template>
<div class="route-card">
  <div class="route-label">
    {{route.label}}
    <div>
      <img :src="`https://api.beeline.sg/companies/${route.transportCompanyId}/logo?height=50`"  />
    </div>
  </div>
  <div class="details">
    <nuxt-link :to="`/routes/${route.id}`" class="description">{{route.name}}</nuxt-link>
    <div class="schedule">{{route.schedule}}</div>

    <div class="booking">
      <div class="timings">
        <div class="timing">
          <div class="location">{{route.from}}</div>
          <div class="time">{{dateformat(route.trips[0].tripStops[0].time, 'HH:MM') }}</div>
        </div>
        <div class="timing">
          <div class="time">-----&gt;</div>
        </div>
        <div class="timing">
          <div class="location">{{route.to}}</div>
          <div class="time">{{dateformat(route.trips[0].tripStops[route.trips[0].tripStops.length - 1].time, 'HH:MM') }}</div>
        </div>
      </div>
      <div class="pricing">
        <div class="date">Next Trip:<br/> <strong>{{dateformat(route.trips[0].date, 'dd mmm yyyy')}}</strong></div>
        <slot name="link"><a class="price" href="https://app.beeline.sg/">${{route.trips[0].price}}</a></slot>
      </div>
    </div>
    <slot>
    </slot>
  </div>
</div>
</template>

<style lang="scss">

.route-card {
  margin: 1em 0;
  box-shadow: 1px 1px 1em rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: row;

  .route-label {
    background-color: #4b3863;
    color: white;
    font-size: 150%;
    width: 3em;
    padding: 0.2em;
    text-align: center;
  }

  .details {
    flex: 1 1 auto;

    .description {
      padding: 10px 10px 5px 10px;
      background: #CCC;
      font-weight: bold;
      font-size: 120%;
      display: block;
    }
    .schedule {
      padding: 2px 10px;
      background: #CCC;
      color: #888;
    }

    .booking {
      display: flex;
      flex-direction: row;

      .timings {
        flex: 1 1 auto;
        text-align: center;

        .timing {
          display: inline-block;
          width: 200px;
          .location {
            font-size: 20px;
          }
          .time {
            font-size: 40px;
          }
        }
      }
      .pricing {
        padding: 5px;
        background: #DDD;
        flex: 0 0 auto;

        .price {
          font-size: 200%;
          font-weight: bold;
          text-align: right;
          display: block;
        }
      }
    }
  }
}

</style>

<script>
import dateformat from 'dateformat'

export default {
  props: ['route'],
  methods: {
    dateformat
  },
}
</script>
