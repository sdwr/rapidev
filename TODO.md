1. authentication, cookies, sessions
 - client login/create account
 - saves client id in cookie
 - uses client id to get profile info, and when modifying orders

 2. courier login/create account
 - saves courier id in cookie
 - uses courier id to get courier info, and when modifying orders


3. accept/assign order flow
- client creates (using profile location as pickup location, adds note)
    <STATUS = PENDING>
    - sets dropoff location on order
    - should be able to add pickup note on existing order
    - should be able to set date for pickup (after x time)

- admin accepts order, confirms date
    <STATUS = ACCEPTED>

- admin assigns courier to order
    <STATUS = ASSIGNED>

- courier accepts order
    <STATUS = CONFIRMED>

- courier sees order in delivery list

-courier picks up order
    <STATUS = PICKED_UP>

- courier delivers order
    <STATUS = DELIVERED>
    - adds confirmation photo/text to order






-- Potential issues

1. order is attached to user profile
- how does this work with multiple user locations?
- attach to user as well/instead?

2. who sets pickup/delivery date / time?
