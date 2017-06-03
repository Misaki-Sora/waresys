package cz.kohlicek.bpini.ui;

import android.app.Fragment;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Bundle;
import android.support.design.widget.NavigationView;
import android.support.v4.view.GravityCompat;
import android.support.v4.widget.DrawerLayout;
import android.support.v7.app.ActionBarDrawerToggle;
import android.support.v7.app.AlertDialog;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.text.Html;
import android.view.Menu;
import android.view.MenuItem;

import butterknife.BindView;
import butterknife.ButterKnife;
import cz.kohlicek.bpini.BuildConfig;
import cz.kohlicek.bpini.R;
import cz.kohlicek.bpini.model.Account;
import cz.kohlicek.bpini.ui.account.AccountActivity;
import cz.kohlicek.bpini.ui.device.DeviceListFragment;
import cz.kohlicek.bpini.ui.item.ItemListFragment;
import cz.kohlicek.bpini.ui.tag.TagListFragment;
import cz.kohlicek.bpini.ui.tag.TagReaderActivity;
import cz.kohlicek.bpini.ui.user.UserListFragment;

public class MainActivity extends AppCompatActivity implements NavigationView.OnNavigationItemSelectedListener {

    @BindView(R.id.drawer_layout)
    DrawerLayout drawer;
    @BindView(R.id.toolbar)
    Toolbar toolbar;
    @BindView(R.id.nav_view)
    NavigationView navigationView;

    private Account account;
    private Menu navMenu;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        ButterKnife.bind(this);

        setSupportActionBar(toolbar);

        ActionBarDrawerToggle toggle = new ActionBarDrawerToggle(this, drawer, toolbar, R.string.navigation_drawer_open, R.string.navigation_drawer_close);
        drawer.setDrawerListener(toggle);
        toggle.syncState();

        navigationView.setNavigationItemSelectedListener(this);

        account = Account.getLocalAccount(this);
        navMenu = navigationView.getMenu();

        if (account == null) {
            startActivity(new Intent(this, LoginActivity.class));
            finish();
        } else if (savedInstanceState == null) {
            navMenu.setGroupVisible(R.id.group_admin, account.isRole(Account.ROLE_ADMIN));
            navMenu.findItem(R.id.nav_account).setTitle(account.getName());

            boolean isNFC = getPackageManager().hasSystemFeature(PackageManager.FEATURE_NFC);
            navMenu.findItem(R.id.nav_tag_reader).setVisible(isNFC);

            onNavigationItemSelected(navMenu.findItem(R.id.nav_items));
        }
    }

    @Override
    public void onBackPressed() {
        if (drawer.isDrawerOpen(GravityCompat.START)) {
            drawer.closeDrawer(GravityCompat.START);
        } else if (!navMenu.findItem(R.id.nav_items).isChecked()) {
            onNavigationItemSelected(navMenu.findItem(R.id.nav_items));
        } else {
            super.onBackPressed();
        }
    }

    private void showInfo() {
        AlertDialog.Builder builder = new AlertDialog.Builder(this);
        builder.setTitle(R.string.app_name);
        builder.setMessage(Html.fromHtml(getResources().getString(R.string.about, BuildConfig.VERSION_NAME)));
        builder.setCancelable(false);
        builder.setPositiveButton(R.string.dialog_ok, new DialogInterface.OnClickListener() {
            public void onClick(DialogInterface dialog, int id) {
                dialog.cancel();
            }
        });
        builder.create().show();
    }

    @SuppressWarnings("StatementWithEmptyBody")
    @Override
    public boolean onNavigationItemSelected(MenuItem item) {
        drawer.closeDrawer(GravityCompat.START);

        if (!item.isChecked()) {
            Fragment fragment = null;
            switch (item.getItemId()) {
                case R.id.nav_items:
                    fragment = new ItemListFragment();
                    break;
                case R.id.nav_tags:
                    fragment = new TagListFragment();
                    break;
                case R.id.nav_devices:
                    fragment = new DeviceListFragment();
                    break;
                case R.id.nav_users:
                    fragment = new UserListFragment();
                    break;
                case R.id.nav_account:
                    startActivity(new Intent(this, AccountActivity.class));
                    return false;
                case R.id.nav_tag_reader:
                    startActivity(new Intent(this, TagReaderActivity.class));
                    return false;
                case R.id.nav_about:
                    showInfo();
                    return false;
                default:
                    return false;
            }

            if (fragment != null) {
                item.setChecked(true);
                getFragmentManager().beginTransaction().replace(R.id.fragment_container, fragment).commit();
            }
        }

        return true;
    }
}