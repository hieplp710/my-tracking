@extends('layouts.app')

@section('content')
<!-- 1. Load libraries -->
<!-- Polyfill(s) for older browsers -->
<script src="lib/core-js/client/shim.min.js"></script>

<script src="lib/zone.js/dist/zone.js"></script>
<script src="lib/reflect-metadata/Reflect.js"></script>
<script src="lib/systemjs/dist/system.src.js"></script>
<script src="lib/jQuery/dist/jquery.js"></script>
<script src="lib/moment-with-locales.js"></script>
<script src="https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/markerclusterer.js"></script>
<script type="text/javascript">
    window.APP_URL = '{{ $url }}';
</script>
<!-- 2. Configure SystemJS -->
<script src="systemjs.config.js"></script>
<script>
    System.import('app')
        .then(null, console.error.bind(console));
</script>
<div class="container full-screen">
    <div class="row">
        <div class="col-lg-12">
            <app>Loading...</app>
        </div>
    </div>
</div>
@endsection
