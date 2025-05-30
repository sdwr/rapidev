1. authentication, cookies, sessions
 - client login/create account
 - saves client id in cookie
 - uses client id to get profile info, and when modifying orders

 2. courier login/create account
 - saves courier id in cookie
 - uses courier id to get courier info, and when modifying orders


3. accept/assign order flow
    
    - client creates (using profile location as pickup location, adds note)
    
    <STATUS = DRAFT>
    - created order
    - sets dropoff location on order
    - should be able to add pickup note on existing order
    - should be able to set date for pickup (after x time)

    <STATUS = PENDING>
    - after paying for order, waiting to be accepted by admin

    <STATUS = PAYMENT_ADJUSTED>
    - admin has to be able to adjust price
    - customer can then confirm and pay difference
    - or reject and get the original payment back

    <STATUS = ACCEPTED>
    - admin accepts order, confirms date

    <STATUS = ASSIGNED_TO_COURIER>
        - admin assigns courier to order

    <STATUS = CONFIRMED_BY_COURIER>
        - courier accepts order
        - courier sees order in delivery list

    <STATUS = PICKED_UP>
        -courier picks up order

    <STATUS = DELIVERED>
        - courier delivers order
        - adds confirmation photo/text to order

    <STATUS = CANCELLED_BY_CLIENT>

    <STATUS = CANCELLED_BY_COURIER>
        -admin can reassign to new courier?

    <STATUS = CANCELLED_BY_ADMIN>


2. text alerts
    - ADMIN
        <STATUS = DRAFT>
        <STATUS = PENDING>
        - order has been created
        
    - CLIENT
        <STATUS = PICKED UP>
        - order has been picked up

        <STATUS = DELIVERED>
        - order has been delivered

        <STATUS = CANCELLED_BY_COURIER>
        <STATUS = CANCLLED_BY_ADMIN>
        <STATUS = CANCELLED_BY_CLIENT>
        - order has been cancelled (reason?)

    - COURIER
        <STATUS = ASSIGNED_TO_COURIER>
        - order has been assigned

    - RECIPIENT
        <STATUS = PICKED_UP>
        - order has been picked up
        
        <STATUS = DELIVERED>
        - order has been delivered

payment
    - one payment for multiple deliveries
    - booking fee is 2.99 or 3.99
    - delivery fee is $10 / ($15 for new clients) fee anywhere in the city
    - anything outside the perimeter is by drive time
        - estimated before accepting
        - roundtrip
        - 0-15min $10
        - 15-25   $15
        - 25-35   $20

    - batch deliveries, pay one booking fee (maximum of 3)
        - but still pay each delivery fee

- admin reports
    -courier payment based on flat fee and time deliveries


FEATURE REQUESTS:

- admin view
    - map of all order, assign to courier on map
    - list of online couriers (logged in in last 15 minutes)


- courier view
    - pending orders appear on map
        - map colors based on status + associated pickup/delivery
    - notification for new orders
    - system notifications
    - map view as default
    - delivery shows start/end/route
    - delivery shows distance

    -upload photo of delivery

    -help menu with problems with delivery

-client view
    -info to register
        - business name
        - business address
        - business contact name
        - business contact phone number
        - business contact email

        

- delivery name is required for items
- delivery picture or select "hand-delivered to customer"
- courier payout view
- admin reports

- client receipts
    -subtotal = delivery fee
    -total = subtotal + booking fee + tax

- client payments tab
    - list of payments, breakdown by date/month

- courier payments tab
    -list of payouts, breakdown by date/month

-admin reports
    - income/payouts
    - refund delivery?
    - pay courier?

-text notification
    - courier is on route
    - courier action (en route)

- client select ASAP delivery or scheduled delivery

- multiple pickup locations with one delivery location?
    - calculate distance between all pickup locations and delivery locations
    - and make one price for all of them

- REGISTERED VS CASUAL CLIENTS
    - more than 5 deliveries in a month (or 10)
    - qualified for lower base rate ($10 vs by drive time)
        - 0-15min $10
        - 15-25   $15
        - 25-35   $20
    - hold max balance of $30,$50   
      - once the delivery is completed, the difference is refunded

- different registration flow for registered clients
    - have to be approved by admin
    - verified checkmark on profile
        -additional business information
    
    - different login flow for preapproved registered clients





User reports
CLIENT
    - list of completed deliveries filtered by day/week/month


ADMIN
    - list of all deliveries
COURIER
    - list of deliveries filtered by day/week/month
    

-- BUGS

-- courier view:
    - map view doesn't always load/center on current location
    - when map view reloads, it loses the route to current destination


-- Potential issues


1. how to attach phone number to pickup/delivery address?
    - would be nice to save phone number on address

2. modifying delivery location/order price after booking

-- tech debt

1. need human-readable errors from backend (ex. profile duplicate email)

2. enums and models are duplicated in backend and shared

